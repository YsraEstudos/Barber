import { NextRequest, NextResponse } from "next/server";
import { fallbackServices } from "@/lib/fallback-data";
import { buildSlotsForDate, getNextDates } from "@/lib/scheduling";
import { isSupabaseConfigured, selectRows } from "@/lib/supabase-rest";
import type { Service, Slot } from "@/lib/types";

type AvailabilityRow = {
  weekday: number;
  start_time: string;
  end_time: string;
  slot_interval_minutes: number;
};

type AppointmentRow = {
  start_time: string;
  end_time: string;
};

function fallbackSlots(serviceId: string) {
  const service =
    fallbackServices.find((item) => item.id === serviceId) ?? fallbackServices[0];

  return getNextDates(10).map((date) => ({
    date,
    slots: buildSlotsForDate(
      date,
      service.duration_minutes,
      [
        {
          weekday: new Date(`${date}T12:00:00`).getDay(),
          start_time: "09:00:00",
          end_time: "18:00:00",
          slot_interval_minutes: 30,
        },
      ],
      [],
    ),
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const serviceId = searchParams.get("serviceId");
  const barberId = searchParams.get("barberId");

  if (!serviceId || !barberId) {
    return NextResponse.json(
      { message: "Servico e barbeiro sao obrigatorios." },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      configured: false,
      days: fallbackSlots(serviceId),
    });
  }

  const services = await selectRows<Service>("services", {
    select: "id,name,description,duration_minutes,price_cents,active",
    id: `eq.${serviceId}`,
    active: "eq.true",
    limit: 1,
  });

  const service = services[0];
  if (!service) {
    return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
  }

  const availability = await selectRows<AvailabilityRow>("availability", {
    select: "weekday,start_time,end_time,slot_interval_minutes",
    barber_id: `eq.${barberId}`,
    active: "eq.true",
    order: "weekday.asc,start_time.asc",
  });

  const days = await Promise.all(
    getNextDates(14).map(async (date) => {
      const appointments = await selectRows<AppointmentRow>("appointments", {
        select: "start_time,end_time",
        barber_id: `eq.${barberId}`,
        appointment_date: `eq.${date}`,
        status: "not.in.(cancelado,nao_compareceu)",
      });

      const slots: Slot[] = buildSlotsForDate(
        date,
        service.duration_minutes,
        availability,
        appointments,
      );

      return { date, slots };
    }),
  );

  return NextResponse.json({ configured: true, days });
}
