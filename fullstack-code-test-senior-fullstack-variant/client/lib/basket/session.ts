import { randomUUID } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "basket_session_id";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/**
 * Identifies the caller's basket from an httpOnly session cookie, creating
 * one if this is their first request. The id is never accepted as a client
 * argument — a client-supplied basket id would let one session read or
 * mutate another session's basket (IDOR).
 */
export async function getOrCreateSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) {
    return existing;
  }

  const sessionId = randomUUID();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
  return sessionId;
}
