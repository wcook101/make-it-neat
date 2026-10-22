import { NextResponse } from "next/server";

import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { updateOutlet } from "@/server/admin/records";
import { parseOutletForm } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await context.params;
  const form = await request.formData();
  const parsed = parseOutletForm(form);
  if (!parsed.ok) {
    if (wantsRedirect(form)) return redirectTo(request, `/admin/outlets/${id}`, "invalid");
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  try {
    await updateOutlet(await getDb(), id, parsed.value);
  } catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
    if (duplicate) {
      if (wantsRedirect(form)) return redirectTo(request, `/admin/outlets/${id}`, "duplicate");
      return NextResponse.json({ error: "That outlet already exists." }, { status: 409 });
    }
    throw error;
  }
  if (wantsRedirect(form)) return redirectTo(request, `/admin/outlets/${id}`);
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
