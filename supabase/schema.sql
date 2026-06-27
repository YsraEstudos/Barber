create extension if not exists pgcrypto;

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
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

create index if not exists availability_barber_weekday_idx
  on public.availability (barber_id, weekday, active);

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

insert into public.barbers (name, bio)
values
  ('Carlos Silva', 'Especialista em corte masculino e barba alinhada.')
on conflict do nothing;

insert into public.services (name, description, duration_minutes, price_cents)
values
  ('Corte', 'Corte masculino com acabamento', 45, 4500),
  ('Barba', 'Modelagem, toalha quente e finalizacao', 30, 3500),
  ('Corte + Barba', 'Combo completo para cabelo e barba', 75, 7500),
  ('Outros servicos', 'Servicos extras configuraveis', 45, 5000)
on conflict do nothing;

insert into public.availability (barber_id, weekday, start_time, end_time, slot_interval_minutes)
select b.id, days.weekday, time '09:00', time '18:00', 30
from public.barbers b
cross join (values (1), (2), (3), (4), (5), (6)) as days(weekday)
where b.name = 'Carlos Silva'
on conflict do nothing;
