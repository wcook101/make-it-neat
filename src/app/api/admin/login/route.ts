import { NextResponse } from "next/server";

import { SESSION_COOKIE, SESSION_TTL_MS } from "@/server/admin/constants";
import { redirectTo, wantsRedirect } from "@/server/admin/guard";
import { sameOrigin } from "@/server/admin/access";
import { attemptLogin } from "@/server/admin/login";
import { isAdminConfigured } from "@/server/admin/password";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "cache-control": "no-store" } });
  }
  const form = await request.formData();
  const result = await attemptLogin({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
  if (!result.token) {
    if (wantsRedirect(form)) return redirectTo(request, "/admin/login", result.status === 429 ? "rate" : "unauthorized");
    return NextResponse.json({ error: result.error }, { status: result.status, headers: { "cache-control": "no-store" } });
  }
  const response = wantsRedirect(form)
    ? redirectTo(request, "/admin")
    : NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  const token = result.token;
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return response;
}
