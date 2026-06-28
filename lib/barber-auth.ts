import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export type BarberAdminSession = {
  email: string;
  name: string;
  role: "admin";
  exp: number;
};

const cookieName = "barber_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 8;
const adminEmail = process.env.BARBER_ADMIN_EMAIL;
const adminPassword = process.env.BARBER_ADMIN_PASSWORD;
const sessionSecret = process.env.BARBER_SESSION_SECRET;

export const isBarberAuthConfigured = Boolean(
  adminEmail && adminPassword && sessionSecret,
);

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string) {
  if (!sessionSecret) {
    throw new Error("BARBER_SESSION_SECRET nao foi configurada.");
  }

  return createHmac("sha256", sessionSecret)
    .update(encodedPayload)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function validateBarberCredentials(email: string, password: string) {
  if (!isBarberAuthConfigured || !adminEmail || !adminPassword) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== adminEmail.toLowerCase() || password !== adminPassword) {
    return null;
  }

  return {
    email: adminEmail,
    name: "Administrador",
    role: "admin" as const,
    exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds,
  };
}

export function createBarberSessionToken(session: BarberAdminSession) {
  const payload = base64UrlEncode(JSON.stringify(session));
  return `${payload}.${signPayload(payload)}`;
}

export function readBarberSession(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as BarberAdminSession;
    if (session.role !== "admin" || session.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setBarberSessionCookie(
  response: NextResponse,
  session: BarberAdminSession,
) {
  response.cookies.set(cookieName, createBarberSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}

export function clearBarberSessionCookie(response: NextResponse) {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}