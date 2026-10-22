import type { Metadata } from "next";
import Link from "next/link";

import { YoutubeEmbed } from "@/components/youtube-embed";
import { videoSongs } from "@/content/songs";

export const metadata: Metadata = {
  title: "Videos",
  description: "YouTube music videos from Make It Neat.",
};

export default function VideosPage() {
  const videos = videoSongs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Videos</h1>
      <p className="mt-4 max-w-2xl leading-7 text-[#d9cbb8]">
        Music videos that have a YouTube link in the catalog. Songs without a video are not listed here.
      </p>
      {videos.length === 0 ? (
        <p className="mt-8 text-[#d9cbb8]" role="status">No videos have been added.</p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {videos.map((song) => (
            <article key={song.slug} className="space-y-3">
              <YoutubeEmbed youtubeId={song.youtubeId} title={song.title} />
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">
                <Link href={`/music/${song.slug}`} className="underline-offset-4 hover:underline">
                  {song.title}
                </Link>
              </h2>
              <p className="text-sm text-[#b7aa9a]">{song.genre}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
