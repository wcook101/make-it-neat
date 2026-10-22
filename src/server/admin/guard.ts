import { NextResponse } from "next/server";

import { adminAccess } from "@/server/admin/access";

export async function assertAdmin(request: Request): Promise<Response | null> {
  const decision = await adminAccess(request);
  if (!decision) return null;
  return NextResponse.json(
    { error: decision.error },
    { status: decision.status, headers: { "cache-control": "no-store" } },
  );
}

export function wantsRedirect(form: FormData): boolean {
  return form.get("redirect") === "1";
}

export function redirectTo(request: Request, path: string, error?: string): NextResponse {
  const url = new URL(path, request.url);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}
