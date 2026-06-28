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

  try {
    const [services, barbers] = await Promise.all([
      selectRows<Service>("services", {
        select: "id,name,description,duration_minutes,price_cents,active",
        active: "eq.true",
        order: "price_cents.asc",
      }),
      selectRows<Barber>("barbers", {
        select: "id,name,bio,avatar_url,active",
        active: "eq.true",
        order: "name.asc",
      }),
    ]);

    return NextResponse.json({
      configured: true,
      services,
      barbers,
    });
  } catch (error) {
    console.error("Erro ao carregar opções do Supabase:", error);
    return NextResponse.json(
      { message: "Não foi possível carregar as opções do banco de dados." },
      { status: 500 },
    );
  }
}
