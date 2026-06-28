import { NextRequest, NextResponse } from "next/server";
import { selectAdminRows, updateAdminRows } from "@/lib/supabase-rest";
import { getErrorMessage } from "@/app/api/_lib/api-errors";
import { isTime } from "@/app/api/_lib/validation";
import { ensureAdmin } from "../_lib/admin-route";
import type { AvailabilityConfig } from "@/lib/types";

type AvailabilityUpdateBody = {
  barberId?: unknown;
  weekday?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  active?: unknown;
};


export async function GET(request: NextRequest) {
  const denied = ensureAdmin(request);
  if (denied) return denied;

  try {
    const { searchParams } = request.nextUrl;
    const barberId = searchParams.get("barberId");

    if (!barberId) {
      return NextResponse.json({ message: "barberId e obrigatorio." }, { status: 400 });
    }

    const availability = await selectAdminRows<AvailabilityConfig>("availability", {
      barber_id: `eq.${barberId}`,
      order: "weekday.asc",
    });

    return NextResponse.json({ configured: true, availability });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = ensureAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as AvailabilityUpdateBody;

    if (typeof body.barberId !== "string" || typeof body.weekday !== "number") {
      return NextResponse.json({ message: "Falta barberId ou weekday." }, { status: 400 });
    }

    const payload: Partial<Pick<AvailabilityConfig, "start_time" | "end_time" | "active">> = {};
    if (body.start_time !== undefined) {
      if (!isTime(body.start_time)) {
        return NextResponse.json({ message: "start_time invalido." }, { status: 400 });
      }
      payload.start_time = body.start_time;
    }
    if (body.end_time !== undefined) {
      if (!isTime(body.end_time)) {
        return NextResponse.json({ message: "end_time invalido." }, { status: 400 });
      }
      payload.end_time = body.end_time;
    }
    if (body.active !== undefined) {
      payload.active = Boolean(body.active);
    }

    const updated = await updateAdminRows<AvailabilityConfig>(
      "availability",
      payload,
      {
        barber_id: `eq.${body.barberId}`,
        weekday: `eq.${body.weekday}`,
      },
    );

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}