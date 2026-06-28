import { NextRequest, NextResponse } from "next/server";
import { selectAdminRows, updateAdminRows } from "@/lib/supabase-rest";
import { getErrorMessage } from "@/app/api/_lib/api-errors";
import { ensureAdmin } from "../_lib/admin-route";
import type { AppointmentStatus } from "@/lib/types";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

type AppointmentJoinRow = {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  clients?: { name?: string; whatsapp?: string } | null;
  services?: { name?: string; price_cents?: number } | null;
  barbers?: { name?: string } | null;
};

type AppointmentUpdateBody = {
  appointmentId?: unknown;
  status?: unknown;
  notes?: unknown;
};


function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return (
    value === "confirmado" ||
    value === "em_atendimento" ||
    value === "finalizado" ||
    value === "cancelado" ||
    value === "nao_compareceu"
  );
}

export async function GET(request: NextRequest) {
  const denied = ensureAdmin(request);
  if (denied) return denied;

  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    const barberId = searchParams.get("barberId");

    const params: Record<string, string> = {
      select: "id,appointment_date,start_time,end_time,status,notes,barber_id,service_id,client_id,clients(name,whatsapp),services(name,price_cents),barbers(name)",
      order: "start_time.asc",
    };

    if (date) {
      params.appointment_date = `eq.${date}`;
    }
    if (barberId && barberId !== "all") {
      params.barber_id = `eq.${barberId}`;
    }

    const rawList = await selectAdminRows<AppointmentJoinRow>("appointments", params);

    const appointments = rawList.map((row) => ({
      id: row.id,
      client_id: row.client_id,
      client_name: row.clients?.name || "Desconhecido",
      client_whatsapp: row.clients?.whatsapp || "",
      barber_id: row.barber_id,
      barber_name: row.barbers?.name || "Desconhecido",
      service_id: row.service_id,
      service_name: row.services?.name || "Desconhecido",
      appointment_date: row.appointment_date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      notes: row.notes,
      price_cents: row.services?.price_cents || 0,
    }));

    return NextResponse.json({ configured: true, appointments });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = ensureAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as AppointmentUpdateBody;

    if (typeof body.appointmentId !== "string" || !isAppointmentStatus(body.status)) {
      return NextResponse.json({ message: "Falta id ou status valido." }, { status: 400 });
    }

    const payload: { status: AppointmentStatus; notes?: string | null } = {
      status: body.status,
    };
    if (body.notes !== undefined) {
      payload.notes = typeof body.notes === "string" ? body.notes : null;
    }

    const updated = await updateAdminRows(
      "appointments",
      payload,
      { id: `eq.${body.appointmentId}` },
    );

    // Query full details for WhatsApp notification async
    selectAdminRows<AppointmentJoinRow>("appointments", {
      select: "id,appointment_date,start_time,end_time,status,notes,barber_id,service_id,client_id,clients(name,whatsapp),services(name,price_cents),barbers(name)",
      id: `eq.${body.appointmentId}`,
      limit: 1
    }).then((rows) => {
      const row = rows?.[0];
      if (!row || !row.clients?.whatsapp) return;

      const clientName = row.clients.name || "Cliente";
      const cleanDate = row.appointment_date.split("-").reverse().join("/");
      const cleanTime = row.start_time.slice(0, 5);
      const barberName = row.barbers?.name || "seu barbeiro";

      let messageText = "";
      if (row.status === "cancelado") {
        messageText = `Olá, ${clientName}! Seu agendamento para o dia ${cleanDate} às ${cleanTime} com o barbeiro ${barberName} foi *cancelado*.`;
      } else if (row.status === "finalizado") {
        messageText = `Olá, ${clientName}! Agradecemos a sua visita hoje à Aureum Grooming. Esperamos que tenha gostado do atendimento com o barbeiro ${barberName}! Até a próxima! ✂️💈`;
      } else if (row.status === "confirmado") {
        messageText = `Olá, ${clientName}! Seu agendamento com o barbeiro ${barberName} foi *confirmado* para o dia ${cleanDate} às ${cleanTime}.`;
      }

      if (messageText) {
        sendWhatsAppMessage(row.clients.whatsapp, messageText).catch((err) => {
          console.error("Falha ao enviar notificação de WhatsApp:", err);
        });
      }
    }).catch((err) => {
      console.error("Falha ao carregar detalhes do agendamento para disparador de WhatsApp:", err);
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}