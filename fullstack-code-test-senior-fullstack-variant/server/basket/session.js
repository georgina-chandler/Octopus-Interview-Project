const { randomUUID } = require("crypto");

const SESSION_COOKIE = "basket_session_id";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/**
 * Identifies the caller's basket from a session cookie, creating one if
 * this is their first request. Returns the session id and, if a new one
 * was minted, the Set-Cookie header value to send back — the id is never
 * accepted as a client argument, since a client-supplied basket id would
 * let one session read or mutate another session's basket (IDOR).
 */
function getOrCreateSessionId(cookieHeader) {
  const existing = parseSessionCookie(cookieHeader);
  if (existing) {
    return { sessionId: existing, setCookie: null };
  }

  const sessionId = randomUUID();
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "Path=/",
    `Max-Age=${THIRTY_DAYS_SECONDS}`,
    "HttpOnly",
    // SameSite=Lax (rather than None) is enough here: the client and this
    // server are different origins (different ports) but the same site
    // (both localhost), which is all SameSite cares about — it ignores
    // port. A real deployment on different registrable domains would need
    // SameSite=None; Secure instead.
    "SameSite=Lax",
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ];

  return { sessionId, setCookie: attributes.join("; ") };
}

module.exports = { getOrCreateSessionId, SESSION_COOKIE };
