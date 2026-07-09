import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  userId: string;
  expiresAt: string;
};

function getSessionSecret() {
  const secret =
    process.env.AUTH_SESSION_SECRET ??
    process.env.SUPABASE_SECRET_KEY ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "siakad-dev-session-secret");

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is required for custom auth sessions.");
  }

  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function encodeSession(payload: SessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function decodeSession(session: string | undefined): SessionPayload | null {
  if (!session) return null;

  const [encodedPayload, signature] = session.split(".");
  if (!encodedPayload || !signature) return null;
  if (!verifySignature(encodedPayload, signature)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (!payload.userId || !payload.expiresAt) return null;
    if (new Date(payload.expiresAt).getTime() <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = encodeSession({
    userId,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSessionPayload() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE);
}
