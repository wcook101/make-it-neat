import type { Metadata } from "next";

import { SongCard } from "@/components/song-card";
import { CATALOG_SIZE, songs } from "@/content/songs";

export const metadata: Metadata = {
  title: "Music",
  description: "Make It Neat song catalog, including placeholders for tracks that do not have audio yet.",
};

export default function MusicPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Music</h1>
      <p className="mt-4 max-w-2xl leading-7 text-[#d9cbb8]">
        {songs.length} catalog entries. Finished songs include the assets that have been supplied. Placeholder slots are labeled and do not play audio.
      </p>
      <p className="mt-2 text-sm text-[#b7aa9a]">Catalog capacity: {CATALOG_SIZE} songs, stored in one file.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {songs.map((song) => (
          <SongCard key={song.slug} song={song} />
        ))}
      </div>
    </div>
  );
}
