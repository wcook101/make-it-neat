import { NextResponse } from "next/server";

import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { createSubmission, listSubmissions } from "@/server/admin/records";
import { addDays, parseSubmissionForm, todayIso } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

export async function GET(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const today = todayIso();
  const submissions = await listSubmissions(await getDb(), {
    search: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    outletId: url.searchParams.get("outlet") ?? undefined,
    due: url.searchParams.get("due") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    dir: url.searchParams.get("dir") ?? undefined,
    today,
    until: addDays(today, 14),
  });
  return NextResponse.json({ submissions }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const form = await request.formData();
  const parsed = parseSubmissionForm(form);
  if (!parsed.ok) {
    if (wantsRedirect(form)) return redirectTo(request, "/admin/submissions/new", "invalid");
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  const id = await createSubmission(await getDb(), parsed.value);
  if (wantsRedirect(form)) return redirectTo(request, `/admin/submissions/${id}`);
  return NextResponse.json({ id }, { status: 201, headers: { "cache-control": "no-store" } });
}
