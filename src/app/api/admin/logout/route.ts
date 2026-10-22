import { SESSION_COOKIE } from "@/server/admin/constants";
import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const form = await request.formData().catch(() => new FormData());
  const response = wantsRedirect(form)
    ? redirectTo(request, "/admin/login")
    : NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  response.cookies.set({ name: SESSION_COOKIE, value: "", httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
