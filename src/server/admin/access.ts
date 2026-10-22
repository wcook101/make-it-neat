import { SESSION_COOKIE } from "@/server/admin/constants";
import { isAdminConfigured } from "@/server/admin/password";
import { readCookie, verifySessionToken } from "@/server/admin/session";

export type AccessDecision = { status: 401 | 403 | 503; error: string } | null;

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const forwarded = request.headers.get("x-forwarded-host");
  const hosts = [request.headers.get("host"), ...(forwarded ? forwarded.split(",") : [])]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  if (hosts.length === 0) {
    try {
      hosts.push(new URL(request.url).host);
    } catch {
      return false;
    }
  }
  return hosts.includes(originHost);
}

export async function adminAccess(request: Request): Promise<AccessDecision> {
  if (!isAdminConfigured()) return { status: 503, error: "Admin is not configured." };
  if (request.method !== "GET" && request.method !== "HEAD" && !sameOrigin(request)) {
    return { status: 403, error: "Forbidden" };
  }
  const session = await verifySessionToken(readCookie(request, SESSION_COOKIE), process.env.ADMIN_SESSION_SECRET);
  if (!session) return { status: 401, error: "Unauthorized" };
  return null;
}
