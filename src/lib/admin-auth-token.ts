const encoder = new TextEncoder();
const sessionDurationSeconds = 60 * 60 * 8;

function baseSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ROBOT_ADMIN_PASSWORD || "robot-cafe-change-this-session-secret";
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function signPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(baseSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

export async function createAdminSessionToken(email: string) {
  const normalizedEmail = email.toLowerCase();
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = `${normalizedEmail}.${expiresAt}`;
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [email, expiresAtValue, signature] = parts;
  const expiresAt = Number(expiresAtValue);
  if (!email || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const expectedSignature = await signPayload(`${email}.${expiresAtValue}`);
  return safeEqual(signature, expectedSignature) ? email : null;
}

export const adminSessionMaxAge = sessionDurationSeconds;
