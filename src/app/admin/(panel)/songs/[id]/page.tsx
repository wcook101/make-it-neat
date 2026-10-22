import { notFound } from "next/navigation";

import { AdminError, SongForm } from "@/components/admin/forms";
import { songById } from "@/server/admin/records";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Edit song" };

export default async function EditSongPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const song = await songById(await getDb(), id);
  if (!song) notFound();
  const uploadsReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">{song.title}</h1>
      <p className="mt-3 text-sm text-[#b7aa9a]">Archiving hides the public song page. It does not delete an MP3 that is already on the site.</p>
      <div className="mt-6 grid gap-4">
        <AdminError code={query.error} />
        <SongForm action={`/api/admin/songs/${song.id}`} song={song} />
      </div>
      <section className="mt-10 grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">Upload files</h2>
        {uploadsReady ? (
          <>
            <form action={`/api/admin/songs/${song.id}/media`} method="post" encType="multipart/form-data" className="grid gap-2">
              <input type="hidden" name="redirect" value="1" />
              <input type="hidden" name="kind" value="audio" />
              <label className="text-sm text-[#d9cbb8]">MP3<input className="mt-1 block text-white" type="file" name="file" accept=".mp3,audio/mpeg" required /></label>
              <button className="w-fit rounded-full border border-white/20 px-4 py-2 text-sm text-white" type="submit">Upload MP3</button>
            </form>
            <form action={`/api/admin/songs/${song.id}/media`} method="post" encType="multipart/form-data" className="grid gap-2">
              <input type="hidden" name="redirect" value="1" />
              <input type="hidden" name="kind" value="image" />
              <label className="text-sm text-[#d9cbb8]">Cover art<input className="mt-1 block text-white" type="file" name="file" accept="image/jpeg,image/png,image/webp" required /></label>
              <button className="w-fit rounded-full border border-white/20 px-4 py-2 text-sm text-white" type="submit">Upload cover</button>
            </form>
          </>
        ) : (
          <p className="text-sm text-[#b7aa9a]">File storage is not configured. You can still paste an HTTPS MP3 or image URL above.</p>
        )}
      </section>
    </div>
  );
}
