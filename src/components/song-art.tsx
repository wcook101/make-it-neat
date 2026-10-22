import Image from "next/image";

import type { Song } from "@/content/songs";

function canOptimize(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return host === "i.ytimg.com" || host.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function SongArt({ song, priority = false }: { song: Song; priority?: boolean }) {
  if (!song.artwork) {
    return (
      <div
        className="flex aspect-square items-end bg-[radial-gradient(circle_at_top,#3a2a16,transparent_55%),#120e0b] p-4"
        role="img"
        aria-label={`Artwork not supplied for ${song.title}`}
      >
        <p className="text-sm font-medium text-[#f3e6cf]">Artwork not supplied</p>
      </div>
    );
  }

  return (
    <figure className="bg-black">
      {canOptimize(song.artwork) ? (
        <Image
          src={song.artwork}
          alt={`${song.title} artwork`}
          width={1280}
          height={720}
          priority={priority}
          className="aspect-square w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={song.artwork} alt={`${song.title} artwork`} className="aspect-square w-full object-cover" />
      )}
      {song.artworkNote ? (
        <figcaption className="px-1 pt-2 text-xs text-[#b7aa9a]">{song.artworkNote}</figcaption>
      ) : null}
    </figure>
  );
}
