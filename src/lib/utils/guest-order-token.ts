import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.GUEST_ORDER_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "GUEST_ORDER_TOKEN_SECRET is not set. Add it to your environment variables.",
    );
  }
  return secret;
}

function sign(orderId: string, expiresAtMs: number): string {
  return createHmac("sha256", getSecret())
    .update(`${orderId}.${expiresAtMs}`)
    .digest("hex");
}

export function generateGuestOrderToken(
  orderId: string,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const expiresAtMs = Date.now() + ttlMs;
  const signature = sign(orderId, expiresAtMs);
  const payload = Buffer.from(String(expiresAtMs)).toString("base64url");
  const sig = Buffer.from(signature).toString("base64url");
  return `${payload}.${sig}`;
}

export function verifyGuestOrderToken(
  orderId: string,
  token: string | null | undefined,
): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;

  let expiresAtMs: number;
  try {
    expiresAtMs = Number(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return false;
  }

  if (!Number.isFinite(expiresAtMs)) return false;
  if (Date.now() > expiresAtMs) return false;

  const expectedSignature = sign(orderId, expiresAtMs);
  const providedSignature = Buffer.from(sigB64, "base64url").toString("utf8");

  const expectedBuf = Buffer.from(expectedSignature, "hex");
  const providedBuf = Buffer.from(providedSignature, "hex");

  if (expectedBuf.length !== providedBuf.length) return false;

  return timingSafeEqual(expectedBuf, providedBuf);
}