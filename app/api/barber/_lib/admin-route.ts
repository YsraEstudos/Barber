import { NextRequest, NextResponse } from "next/server";
import { readBarberSession } from "@/lib/barber-auth";
import { isSupabaseAdminConfigured } from "@/lib/supabase-rest";

export function ensureAdmin(request: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ message: "Supabase admin nao configurado." }, { status: 503 });
  }

  if (!readBarberSession(request)) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: 401 });
  }

  return null;
}
