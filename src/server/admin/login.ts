import { LOGIN_LIMIT, LOGIN_WINDOW_MS } from "@/server/admin/constants";
import { adminEmail, isAdminConfigured, verifyPassword } from "@/server/admin/password";
import { failedLoginCount, recordFailedLogin } from "@/server/admin/records";
import { createSessionToken } from "@/server/admin/session";
import { getDb } from "@/server/db/index";

export async function attemptLogin(input: { email: string; password: string }): Promise<{ status: number; token?: string; error?: string }> {
  if (!isAdminConfigured()) return { status: 503, error: "Admin is not configured." };
  const email = input.email.trim().toLowerCase();
  const db = await getDb();
  const since = new Date(Date.now() - LOGIN_WINDOW_MS).toISOString();
  if (await failedLoginCount(db, email || "unknown", since) >= LOGIN_LIMIT) {
    return { status: 429, error: "Too many attempts." };
  }
  const emailOk = email.length > 0 && email === adminEmail();
  const passwordOk = verifyPassword(input.password, process.env.ADMIN_PASSWORD_HASH);
  if (!emailOk || !passwordOk) {
    await recordFailedLogin(db, email || "unknown");
    return { status: 401, error: "Sign-in failed." };
  }
  return { status: 200, token: await createSessionToken(email, process.env.ADMIN_SESSION_SECRET!) };
}
