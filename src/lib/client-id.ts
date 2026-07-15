export function createClientId(prefix = "id") {
  const browserCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (browserCrypto && typeof browserCrypto.randomUUID === "function") {
    return `${prefix}-${browserCrypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
