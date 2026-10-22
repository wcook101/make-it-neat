import { NextResponse } from "next/server";

import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { createSong, listSongs, songBySlug } from "@/server/admin/records";
import { parseSongForm } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

function uniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

export async function GET(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const songs = await listSongs(await getDb());
  return NextResponse.json({ songs }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const form = await request.formData();
  const parsed = parseSongForm(form);
  if (!parsed.ok) {
    if (wantsRedirect(form)) return redirectTo(request, "/admin/songs/new", "invalid");
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  const db = await getDb();
  if (await songBySlug(db, parsed.value.slug)) {
    if (wantsRedirect(form)) return redirectTo(request, "/admin/songs/new", "duplicate");
    return NextResponse.json({ error: "That slug is already used." }, { status: 409, headers: { "cache-control": "no-store" } });
  }
  try {
    const song = await createSong(db, parsed.value);
    if (wantsRedirect(form)) return redirectTo(request, `/admin/songs/${song.id}`);
    return NextResponse.json({ song }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (uniqueViolation(error)) {
      return NextResponse.json({ error: "That slug is already used." }, { status: 409, headers: { "cache-control": "no-store" } });
    }
    throw error;
  }
}
