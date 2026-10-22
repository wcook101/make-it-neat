import { NextResponse } from "next/server";

import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { updateSubmission } from "@/server/admin/records";
import { parseSubmissionForm } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await context.params;
  const form = await request.formData();
  const parsed = parseSubmissionForm(form);
  if (!parsed.ok) {
    if (wantsRedirect(form)) return redirectTo(request, `/admin/submissions/${id}`, "invalid");
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  await updateSubmission(await getDb(), id, parsed.value);
  if (wantsRedirect(form)) return redirectTo(request, `/admin/submissions/${id}`);
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
