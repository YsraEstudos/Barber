import { NextRequest, NextResponse } from "next/server";
import { insertAdminRows, updateAdminRows } from "@/lib/supabase-rest";
import { getErrorMessage } from "@/app/api/_lib/api-errors";
import { parseNonNegativeInteger, parsePositiveInteger } from "@/app/api/_lib/validation";
import { ensureAdmin } from "../_lib/admin-route";
import type { Service } from "@/lib/types";

type ServiceBody = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  duration_minutes?: unknown;
  price_cents?: unknown;
  active?: unknown;
};


export async function POST(request: NextRequest) {
  const denied = ensureAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as ServiceBody;
    const durationMinutes = parsePositiveInteger(body.duration_minutes);
    const priceCents = parseNonNegativeInteger(body.price_cents);

    if (typeof body.name !== "string" || !body.name.trim() || durationMinutes === null || priceCents === null) {
      return NextResponse.json({ message: "Nome, duracao e preco validos sao obrigatorios." }, { status: 400 });
    }

    const newRows = await insertAdminRows<Service>("services", {
      name: body.name.trim(),
      description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
      duration_minutes: durationMinutes,
      price_cents: priceCents,
      active: true,
    });

    return NextResponse.json({ success: true, service: newRows?.[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = ensureAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as ServiceBody;

    if (typeof body.id !== "string") {
      return NextResponse.json({ message: "ID do servico e obrigatorio." }, { status: 400 });
    }

    const payload: Partial<Omit<Service, "id">> = {};
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ message: "Nome invalido." }, { status: 400 });
      }
      payload.name = body.name.trim();
    }
    if (body.description !== undefined) {
      payload.description = typeof body.description === "string" && body.description.trim() ? body.description.trim() : null;
    }
    if (body.duration_minutes !== undefined) {
      const durationMinutes = parsePositiveInteger(body.duration_minutes);
      if (durationMinutes === null) {
        return NextResponse.json({ message: "Duracao invalida." }, { status: 400 });
      }
      payload.duration_minutes = durationMinutes;
    }
    if (body.price_cents !== undefined) {
      const priceCents = parseNonNegativeInteger(body.price_cents);
      if (priceCents === null) {
        return NextResponse.json({ message: "Preco invalido." }, { status: 400 });
      }
      payload.price_cents = priceCents;
    }
    if (body.active !== undefined) {
      payload.active = Boolean(body.active);
    }

    const updated = await updateAdminRows<Service>(
      "services",
      payload,
      { id: `eq.${body.id}` },
    );

    return NextResponse.json({ success: true, service: updated?.[0] });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}