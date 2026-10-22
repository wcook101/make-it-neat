import { NextResponse } from "next/server";

import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { songById, songBySlug, updateSong } from "@/server/admin/records";
import { parseSongForm } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await context.params;
  const form = await request.formData();
  const parsed = parseSongForm(form);
  if (!parsed.ok) {
    if (wantsRedirect(form)) return redirectTo(request, `/admin/songs/${id}`, "invalid");
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  const db = await getDb();
  const existingSlug = await songBySlug(db, parsed.value.slug);
  if (existingSlug && existingSlug.id !== id) {
    if (wantsRedirect(form)) return redirectTo(request, `/admin/songs/${id}`, "duplicate");
    return NextResponse.json({ error: "That slug is already used." }, { status: 409, headers: { "cache-control": "no-store" } });
  }
  const song = await updateSong(db, id, parsed.value);
  if (!song) return NextResponse.json({ error: "Song not found." }, { status: 404, headers: { "cache-control": "no-store" } });
  if (wantsRedirect(form)) return redirectTo(request, `/admin/songs/${id}`);
  return NextResponse.json({ song }, { headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request, context: Context) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await context.params;
  const song = await songById(await getDb(), id);
  if (!song) return NextResponse.json({ error: "Song not found." }, { status: 404, headers: { "cache-control": "no-store" } });
  return NextResponse.json({ song }, { headers: { "cache-control": "no-store" } });
}
