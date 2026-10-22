import { NextResponse } from "next/server";

import { assertAdmin, redirectTo, wantsRedirect } from "@/server/admin/guard";
import { setSongFile, songById } from "@/server/admin/records";
import { uploadStorageDecision, validateUpload } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await context.params;
  const form = await request.formData();
  const kind = form.get("kind") === "image" ? "image" : form.get("kind") === "audio" ? "audio" : null;
  const file = form.get("file");
  if (!kind || !(file instanceof File)) {
    if (wantsRedirect(form)) return redirectTo(request, `/admin/songs/${id}`, "invalid");
    return NextResponse.json({ error: "Choose a file." }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  const decision = uploadStorageDecision(
    validateUpload(kind, { type: file.type, size: file.size, name: file.name }),
    Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  );
  if (decision) {
    if (wantsRedirect(form)) return redirectTo(request, `/admin/songs/${id}`, decision.status === 503 ? "config" : "invalid");
    return NextResponse.json({ error: decision.error }, { status: decision.status, headers: { "cache-control": "no-store" } });
  }
  const db = await getDb();
  const song = await songById(db, id);
  if (!song) return NextResponse.json({ error: "Song not found." }, { status: 404, headers: { "cache-control": "no-store" } });
  const extension = file.name.toLowerCase().split(".").pop() === "jpeg" ? "jpg" : file.name.toLowerCase().split(".").pop();
  const { put } = await import("@vercel/blob");
  const blob = await put(`catalog/${kind}/${song.slug}-${Date.now()}.${extension}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: file.type || (kind === "audio" ? "audio/mpeg" : undefined),
  });
  await setSongFile(db, id, kind === "audio" ? "mp3_url" : "artwork_url", blob.url);
  if (wantsRedirect(form)) return redirectTo(request, `/admin/songs/${id}`);
  return NextResponse.json({ url: blob.url }, { headers: { "cache-control": "no-store" } });
}
