import { NextResponse } from "next/server";
import { fallbackBarbers, fallbackServices } from "@/lib/fallback-data";
import { isSupabaseConfigured, selectRows } from "@/lib/supabase-rest";
import type { Barber, Service } from "@/lib/types";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      configured: false,
      services: fallbackServices,
      barbers: fallbackBarbers,
    });
  }

  const [services, barbers] = await Promise.all([
    selectRows<Service>("services", {
      select: "id,name,description,duration_minutes,price_cents,active",
      active: "eq.true",
      order: "price_cents.asc",
    }),
    selectRows<Barber>("barbers", {
      select: "id,name,bio,active",
      active: "eq.true",
      order: "name.asc",
    }),
  ]);

  return NextResponse.json({
    configured: true,
    services: services.length ? services : fallbackServices,
    barbers: barbers.length ? barbers : fallbackBarbers,
  });
}
