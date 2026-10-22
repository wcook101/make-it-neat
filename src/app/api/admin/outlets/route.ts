import { NextResponse } from "next/server";

import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { createOutlet, listOutlets } from "@/server/admin/records";
import { parseOutletForm } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

export async function GET(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  return NextResponse.json({ outlets: await listOutlets(await getDb()) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const form = await request.formData();
  const parsed = parseOutletForm(form);
  if (!parsed.ok) {
    if (wantsRedirect(form)) return redirectTo(request, "/admin/outlets/new", "invalid");
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  try {
    const outlet = await createOutlet(await getDb(), parsed.value);
    if (wantsRedirect(form)) return redirectTo(request, `/admin/outlets/${outlet.id}`);
    return NextResponse.json({ outlet }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
    if (duplicate) {
      if (wantsRedirect(form)) return redirectTo(request, "/admin/outlets/new", "duplicate");
      return NextResponse.json({ error: "That outlet already exists." }, { status: 409, headers: { "cache-control": "no-store" } });
    }
    throw error;
  }
}
