import { NextRequest, NextResponse } from "next/server";
import { addMinutes, buildSlotsForDate } from "@/lib/scheduling";
import { insertRows, isSupabaseConfigured, selectRows } from "@/lib/supabase-rest";
import type { BookingPayload, BookingSummary, Barber, Service } from "@/lib/types";

type ClientRow = {
  id: string;
  name: string;
  whatsapp: string;
};

type AvailabilityRow = {
  weekday: number;
  start_time: string;
  end_time: string;
  slot_interval_minutes: number;
};

type AppointmentRow = {
  id: string;
  start_time: string;
  end_time: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function validatePayload(payload: BookingPayload) {
  const required = [
    payload.serviceId,
    payload.barberId,
    payload.date,
    payload.startTime,
    payload.clientName,
    payload.whatsapp,
  ];

  if (required.some((value) => !value || !String(value).trim())) {
    return "Preencha todos os campos obrigatorios.";
  }

  if (onlyDigits(payload.whatsapp).length < 10) {
    return "Informe um WhatsApp valido com DDD.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as BookingPayload;
  const validationMessage = validatePayload(payload);

  if (validationMessage) {
    return NextResponse.json({ message: validationMessage }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { message: "Configure o Supabase para gravar agendamentos reais." },
      { status: 503 },
    );
  }

  const [services, barbers] = await Promise.all([
    selectRows<Service>("services", {
      select: "id,name,description,duration_minutes,price_cents,active",
      id: `eq.${payload.serviceId}`,
      active: "eq.true",
      limit: 1,
    }),
    selectRows<Barber>("barbers", {
      select: "id,name,bio,active",
      id: `eq.${payload.barberId}`,
      active: "eq.true",
      limit: 1,
    }),
  ]);

  const service = services[0];
  const barber = barbers[0];

  if (!service || !barber) {
    return NextResponse.json(
      { message: "Servico ou barbeiro indisponivel." },
      { status: 404 },
    );
  }

  const availability = await selectRows<AvailabilityRow>("availability", {
    select: "weekday,start_time,end_time,slot_interval_minutes",
    barber_id: `eq.${payload.barberId}`,
    active: "eq.true",
  });
  const appointments = await selectRows<AppointmentRow>("appointments", {
    select: "id,start_time,end_time",
    barber_id: `eq.${payload.barberId}`,
    appointment_date: `eq.${payload.date}`,
    status: "not.in.(cancelado,nao_compareceu)",
  });

  const availableSlots = buildSlotsForDate(
    payload.date,
    service.duration_minutes,
    availability,
    appointments,
  );
  const chosenSlot = availableSlots.find(
    (slot) => slot.start_time.slice(0, 5) === payload.startTime.slice(0, 5),
  );

  if (!chosenSlot) {
    return NextResponse.json(
      { message: "Esse horario acabou de ficar indisponivel." },
      { status: 409 },
    );
  }

  const normalizedWhatsapp = onlyDigits(payload.whatsapp);
  const existingClients = await selectRows<ClientRow>("clients", {
    select: "id,name,whatsapp",
    whatsapp: `eq.${normalizedWhatsapp}`,
    limit: 1,
  });

  const client =
    existingClients[0] ??
    (
      await insertRows<ClientRow>("clients", {
        name: payload.clientName.trim(),
        whatsapp: normalizedWhatsapp,
      })
    )[0];

  const endTime = addMinutes(chosenSlot.start_time, service.duration_minutes);
  const appointment = (
    await insertRows<AppointmentRow>("appointments", {
      client_id: client.id,
      barber_id: barber.id,
      service_id: service.id,
      appointment_date: payload.date,
      start_time: chosenSlot.start_time,
      end_time: endTime,
      status: "confirmado",
      notes: payload.notes?.trim() || null,
    })
  )[0];

  const summary: BookingSummary = {
    appointmentId: appointment.id,
    clientName: client.name,
    whatsapp: normalizedWhatsapp,
    serviceName: service.name,
    barberName: barber.name,
    date: payload.date,
    startTime: chosenSlot.start_time,
    endTime,
    notes: payload.notes?.trim() || null,
  };

  return NextResponse.json(summary, { status: 201 });
}
