const encoder = new TextEncoder();
const decoder = new TextDecoder();
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

function toBase64Url(value: string) {
  const bytes = encoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return decoder.decode(bytes);
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
  const encodedEmail = toBase64Url(normalizedEmail);
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = `${encodedEmail}.${expiresAt}`;
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedEmail, expiresAtValue, signature] = parts;
  const expiresAt = Number(expiresAtValue);
  if (!encodedEmail || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const expectedSignature = await signPayload(`${encodedEmail}.${expiresAtValue}`);
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    return fromBase64Url(encodedEmail);
  } catch {
    return null;
  }
}

export const adminSessionMaxAge = sessionDurationSeconds;
