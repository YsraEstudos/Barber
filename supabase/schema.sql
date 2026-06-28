create extension if not exists pgcrypto;

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_interval_minutes integer not null default 30 check (slot_interval_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  barber_id uuid not null references public.barbers(id),
  service_id uuid not null references public.services(id),
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'confirmado'
    check (status in ('confirmado', 'em_atendimento', 'finalizado', 'cancelado', 'nao_compareceu')),
  notes text,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists barbers_name_unique_idx
  on public.barbers (name);

create unique index if not exists services_name_unique_idx
  on public.services (name);

create index if not exists availability_barber_weekday_idx
  on public.availability (barber_id, weekday, active);

create unique index if not exists availability_unique_window_idx
  on public.availability (barber_id, weekday, start_time, end_time);

create index if not exists appointments_barber_date_idx
  on public.appointments (barber_id, appointment_date, status);

create unique index if not exists appointments_unique_active_slot_idx
  on public.appointments (barber_id, appointment_date, start_time)
  where status in ('confirmado', 'em_atendimento');

alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.availability enable row level security;
alter table public.appointments enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Public can read active barbers" on public.barbers;
drop policy if exists "Public can read active services" on public.services;
drop policy if exists "Public can read active availability" on public.availability;
drop policy if exists "Public can create clients" on public.clients;
drop policy if exists "Public can find clients by whatsapp" on public.clients;
drop policy if exists "Public can read booked slots" on public.appointments;
drop policy if exists "Public can create confirmed appointments" on public.appointments;

create policy "Public can read active barbers"
  on public.barbers for select
  to anon
  using (active = true);

create policy "Public can read active services"
  on public.services for select
  to anon
  using (active = true);

create policy "Public can read active availability"
  on public.availability for select
  to anon
  using (active = true);

create or replace function public.get_public_booked_slots(
  p_barber_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  appointment_date date,
  start_time time,
  end_time time
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select a.appointment_date, a.start_time, a.end_time
  from public.appointments as a
  where a.barber_id = p_barber_id
    and a.appointment_date between p_start_date and p_end_date
    and a.status in ('confirmado', 'em_atendimento');
$$;

create or replace function public.create_public_booking(
  p_service_id uuid,
  p_barber_id uuid,
  p_date date,
  p_start_time time,
  p_client_name text,
  p_whatsapp text,
  p_notes text default null
)
returns table (
  appointment_id uuid,
  client_name text,
  whatsapp text,
  service_name text,
  barber_name text,
  appointment_date date,
  start_time time,
  end_time time,
  notes text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_service public.services%rowtype;
  v_barber public.barbers%rowtype;
  v_client_id uuid;
  v_appointment_id uuid;
  v_end_time time;
  v_clean_name text := btrim(coalesce(p_client_name, ''));
  v_clean_whatsapp text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  v_clean_notes text := nullif(btrim(coalesce(p_notes, '')), '');
begin
  if char_length(v_clean_name) < 2 then
    raise exception 'Nome invalido.';
  end if;

  if char_length(v_clean_whatsapp) < 10 then
    raise exception 'WhatsApp invalido.';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id and active = true;

  if not found then
    raise exception 'Servico indisponivel.';
  end if;

  select * into v_barber
  from public.barbers
  where id = p_barber_id and active = true;

  if not found then
    raise exception 'Barbeiro indisponivel.';
  end if;

  v_end_time := p_start_time + make_interval(mins => v_service.duration_minutes);

  if (p_date + p_start_time) <= now() then
    raise exception 'Horario indisponivel.';
  end if;

  if not exists (
    select 1
    from public.availability as av
    where av.barber_id = p_barber_id
      and av.active = true
      and av.weekday = extract(dow from p_date)::integer
      and p_start_time >= av.start_time
      and v_end_time <= av.end_time
      and mod((extract(epoch from (p_start_time - av.start_time)) / 60)::integer, av.slot_interval_minutes) = 0
  ) then
    raise exception 'Horario indisponivel.';
  end if;

  if exists (
    select 1
    from public.appointments as ap
    where ap.barber_id = p_barber_id
      and ap.appointment_date = p_date
      and ap.status in ('confirmado', 'em_atendimento')
      and p_start_time < ap.end_time
      and v_end_time > ap.start_time
  ) then
    raise exception 'Esse horario acabou de ficar indisponivel.';
  end if;

  insert into public.clients (name, whatsapp)
  values (v_clean_name, v_clean_whatsapp)
  on conflict on constraint clients_whatsapp_key do update
    set name = excluded.name
  returning id into v_client_id;

  insert into public.appointments (
    client_id,
    barber_id,
    service_id,
    appointment_date,
    start_time,
    end_time,
    status,
    notes
  ) values (
    v_client_id,
    p_barber_id,
    p_service_id,
    p_date,
    p_start_time,
    v_end_time,
    'confirmado',
    v_clean_notes
  )
  returning id into v_appointment_id;

  return query
  select
    v_appointment_id,
    v_clean_name,
    v_clean_whatsapp,
    v_service.name,
    v_barber.name,
    p_date,
    p_start_time,
    v_end_time,
    v_clean_notes;
exception
  when unique_violation then
    raise exception 'Esse horario acabou de ficar indisponivel.';
end;
$$;

revoke all on function public.get_public_booked_slots(uuid, date, date) from public;
revoke all on function public.create_public_booking(uuid, uuid, date, time, text, text, text) from public;
grant execute on function public.get_public_booked_slots(uuid, date, date) to anon;
grant execute on function public.create_public_booking(uuid, uuid, date, time, text, text, text) to anon;

-- Seed Barbers
insert into public.barbers (id, name, bio, avatar_url)
values
  ('c0000000-0000-0000-0000-000000000001', 'Carlos Silva', 'Especialista em Fade & Barba Tradicional', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDetWuc1niYUYmB-3ujxbnjtFFBjUcYrEpElTieV30Jk1k-erQlZsQCgPqxn41ADnvQPezt1BkHJib8q7_9U6sax4n8MwlcDvW9jF8Wvyc4lnEoNeHBzX2HCZkFZkp8EcmQaI5lkTArIfsHPM2m2yXMw7mQJ_omUfeGo0goI8oUltpylQDoduAbKwGkIeuUF4fDyhhcF3l1Fc7QtnNGufLJ0_qgqmiX88cS7lvB9HraMvh9X_iEgul5UQu4kGEaozWdrsMUpbRODQM'),
  ('c0000000-0000-0000-0000-000000000002', 'Miguel Santos', 'Mestre em Tesoura & Textura', 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2FkzJ61IifjIbCXpyM44n-zkFxBjmOX6fbZGw_RMpJA_LMKYvaDNKZCWbqqSU9Ilx8-4AqTA4A23LdsAgubTlBcQQhuP_Wb0Q7htynOViuqnxqyD8g27Z7NYoztB05rTLCTop1A-t4aAYHXTKgK3GUlS2013hz-rrDvlBKYQ813v5XEHTuJarx4u23GtYwzFdZ46LX36LyvC286z6E9Ki6rJundsk1P-zX-9x792ODdZRna3pLewGQS4ylEsN19xvnnAyn1YnUPw'),
  ('c0000000-0000-0000-0000-000000000003', 'Alexandre Costa', 'Consultoria de Imagem & Cortes Premium', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXA7et8yIMLDl0g7Zq3dFNtDxGYHuPbrKCtzyaVmj9dYRscUalnEjxiAF0ccc7Ww3zG3lWb8qkMayzLA-5-kKrUJ-n7yO9_VoriIq9IBAGUFL-MSOw7tiZHHGzseL5_aRIT285AR6QPBPh5Z4DJn9CqR7_CjeRt3gjGQxeyplaR84rf-hUdFqZAg6YiU8hZwYv1NM0lPyLMdNARHCTtKVQtQLspbnB7gsGt7w3L29TCoxBq4OCGSpBx2qvXUCOzdcc-hPmey4dNzM')
on conflict (id) do update set
  name = excluded.name,
  bio = excluded.bio,
  avatar_url = excluded.avatar_url;

-- Seed Services
insert into public.services (id, name, description, duration_minutes, price_cents)
values
  ('f0000000-0000-0000-0000-000000000001', 'Corte de Cabelo', 'Corte clássico ou moderno, com finalização premium.', 45, 6000),
  ('f0000000-0000-0000-0000-000000000002', 'Combo Vip', 'Corte de cabelo e barba com toalha quente e massagem facial.', 75, 11000),
  ('f0000000-0000-0000-0000-000000000003', 'Barba Tradicional', 'Alinhamento perfeito, toalha quente e óleos essenciais.', 30, 4500),
  ('f0000000-0000-0000-0000-000000000004', 'Coloração', 'Disfarce de fios brancos com pigmentação natural.', 40, 7000)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price_cents = excluded.price_cents;

-- Seed Availability for all barbers
insert into public.availability (barber_id, weekday, start_time, end_time, slot_interval_minutes)
select b.id, days.weekday, time '09:00', time '18:00', 30
from public.barbers b
cross join (values (1), (2), (3), (4), (5), (6)) as days(weekday)
on conflict (barber_id, weekday, start_time, end_time) do nothing;