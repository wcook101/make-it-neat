import Link from "next/link";

import { STATUS_LABELS, type SongStatus } from "@/server/admin/constants";
import { listSongs } from "@/server/admin/records";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Songs" };

export default async function SongsPage() {
  const songs = await listSongs(await getDb());
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Songs</h1>
        <Link href="/admin/songs/new" className="rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]">
          Add song
        </Link>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-[#b7aa9a]">Placeholder catalog slots are not songs and are not listed here.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[#b7aa9a]">
            <tr>
              <th className="py-2">Title</th>
              <th>Status</th>
              <th>Genre</th>
              <th>MP3</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id} className="border-t border-white/10">
                <td className="py-3">
                  <Link href={`/admin/songs/${song.id}`} className="text-white">{song.title}</Link>
                </td>
                <td>{STATUS_LABELS[song.status as SongStatus]}</td>
                <td>{song.genre}</td>
                <td>{song.mp3_url ? "Attached" : "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
