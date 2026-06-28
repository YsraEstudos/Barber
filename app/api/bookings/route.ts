import { NextRequest, NextResponse } from "next/server";
import { callRpc, isSupabaseConfigured } from "@/lib/supabase-rest";
import type { BookingPayload, BookingSummary } from "@/lib/types";
import { onlyDigits } from "@/app/_lib/booking-formatters";
import { getErrorMessage } from "@/app/api/_lib/api-errors";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

type BookingRpcRow = {
  appointment_id: string;
  client_name: string;
  whatsapp: string;
  service_name: string;
  barber_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
};

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

  try {
    const rows = await callRpc<BookingRpcRow[]>("create_public_booking", {
      p_service_id: payload.serviceId,
      p_barber_id: payload.barberId,
      p_date: payload.date,
      p_start_time: payload.startTime,
      p_client_name: payload.clientName,
      p_whatsapp: onlyDigits(payload.whatsapp),
      p_notes: payload.notes?.trim() || null,
    });
    const appointment = rows[0];

    if (!appointment) {
      return NextResponse.json(
        { message: "Nao foi possivel criar o agendamento." },
        { status: 500 },
      );
    }

    const summary: BookingSummary = {
      appointmentId: appointment.appointment_id,
      clientName: appointment.client_name,
      whatsapp: appointment.whatsapp,
      serviceName: appointment.service_name,
      barberName: appointment.barber_name,
      date: appointment.appointment_date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      notes: appointment.notes,
    };

    // Send WhatsApp confirmation asynchronously
    const cleanDate = appointment.appointment_date.split("-").reverse().join("/");
    const cleanTime = appointment.start_time.slice(0, 5);
    const messageText =
      `Olá, ${appointment.client_name}! Seu agendamento foi *confirmado* na Aureum Grooming.\n\n` +
      `✂️ *Serviço:* ${appointment.service_name}\n` +
      `💈 *Barbeiro:* ${appointment.barber_name}\n` +
      `📅 *Data:* ${cleanDate}\n` +
      `⏰ *Horário:* ${cleanTime}\n\n` +
      `Te esperamos lá!`;

    sendWhatsAppMessage(appointment.whatsapp, messageText).catch((err) => {
      console.error("Falha ao enviar notificação de WhatsApp:", err);
    });

    return NextResponse.json(summary, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    let status = 500;
    if (message.toLowerCase().includes("invalido") || message.toLowerCase().includes("inválido")) {
      status = 400;
    } else if (
      message.toLowerCase().includes("indisponivel") ||
      message.toLowerCase().includes("indisponível") ||
      message.toLowerCase().includes("conflito")
    ) {
      status = 409;
    }
    return NextResponse.json({ message }, { status });
  }
}