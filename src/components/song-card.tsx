import Link from "next/link";

import type { Song } from "@/content/songs";
import { AudioPlayer } from "@/components/audio-player";
import { SongArt } from "@/components/song-art";

export function SongCard({ song }: { song: Song }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#14110e]">
      <SongArt song={song} />
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#d6b16a]">
          {song.placeholder ? "Placeholder" : song.genre}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-white">
          <Link href={`/music/${song.slug}`} className="underline-offset-4 hover:underline">
            {song.title}
          </Link>
        </h3>
        <p className="text-sm leading-6 text-[#d9cbb8]">{song.description}</p>
        <AudioPlayer title={song.title} src={song.mp3Url} />
      </div>
    </article>
  );
}
