import { NextRequest, NextResponse } from "next/server";
import {
  clearBarberSessionCookie,
  isBarberAuthConfigured,
  readBarberSession,
  setBarberSessionCookie,
  validateBarberCredentials,
} from "@/lib/barber-auth";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function GET(request: NextRequest) {
  const session = isBarberAuthConfigured ? readBarberSession(request) : null;

  return NextResponse.json({
    configured: isBarberAuthConfigured,
    user: session
      ? {
          email: session.email,
          name: session.name,
          role: session.role,
        }
      : null,
  });
}

const DEMO_CREDENTIALS = [
  { email: "admin@barber.com", password: "admin123", name: "Dono/Admin", role: "admin", id: "admin-id" },
  { email: "carlos@barber.com", password: "carlos123", name: "Carlos Silva", role: "barber", id: "c0000000-0000-0000-0000-000000000001" },
  { email: "miguel@barber.com", password: "barber123", name: "Miguel Santos", role: "barber", id: "c0000000-0000-0000-0000-000000000002" },
  { email: "alexandre@barber.com", password: "barber123", name: "Alexandre Costa", role: "barber", id: "c0000000-0000-0000-0000-000000000003" },
];

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LoginBody;
  const email = body.email;
  const password = body.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { message: "Email e senha sao obrigatorios." },
      { status: 400 },
    );
  }

  if (!isBarberAuthConfigured) {
    const matched = DEMO_CREDENTIALS.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password,
    );

    if (!matched) {
      return NextResponse.json(
        { message: "Credenciais de teste inválidas." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        role: matched.role,
      },
      isDemo: true,
    });
  }

  const session = validateBarberCredentials(email, password);
  if (!session) {
    return NextResponse.json(
      { message: "Credenciais invalidas." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    user: {
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
  setBarberSessionCookie(response, session);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearBarberSessionCookie(response);
  return response;
}