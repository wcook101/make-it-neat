import { SESSION_TTL_MS } from "@/server/admin/constants";

type SessionPayload = {
  email: string;
  exp: number;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  try {
    const pad = (4 - (value.length % 4)) % 4;
    const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(pad);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch {
    return null;
  }
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSessionToken(email: string, secret: string, now = Date.now()): Promise<string> {
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ email, exp: now + SESSION_TTL_MS } satisfies SessionPayload)));
  const key = await importKey(secret);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  return `${payload}.${base64UrlEncode(signature)}`;
}

export async function verifySessionToken(token: string | undefined | null, secret: string | undefined, now = Date.now()): Promise<SessionPayload | null> {
  if (!token || !secret || secret.length < 32) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || token.split(".").length !== 2) return null;
  const signatureBytes = base64UrlDecode(signature);
  if (!signatureBytes) return null;
  const key = await importKey(secret);
  const signatureBuffer = signatureBytes.buffer.slice(signatureBytes.byteOffset, signatureBytes.byteOffset + signatureBytes.byteLength) as ArrayBuffer;
  const valid = await crypto.subtle.verify("HMAC", key, signatureBuffer, new TextEncoder().encode(payload));
  if (!valid) return null;
  const decoded = base64UrlDecode(payload);
  if (!decoded) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(decoded)) as SessionPayload;
    if (!parsed.email || typeof parsed.exp !== "number" || parsed.exp <= now) return null;
    const expected = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (expected && parsed.email !== expected) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return undefined;
}
