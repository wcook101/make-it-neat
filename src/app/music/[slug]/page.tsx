import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AudioPlayer } from "@/components/audio-player";
import { ShareBar } from "@/components/share-bar";
import { SongArt } from "@/components/song-art";
import { YoutubeEmbed } from "@/components/youtube-embed";
import { songs } from "@/content/songs";
import { getPublicSong } from "@/server/catalog/load";

type Params = { slug: string };

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return songs.map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const song = await getPublicSong(slug);
  if (!song) return { title: "Song" };
  return {
    title: song.title,
    description: song.description,
  };
}

export default async function SongPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const song = await getPublicSong(slug);
  if (!song) notFound();

  return (
    <article className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,360px)_1fr]">
      <SongArt song={song} priority />
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#d6b16a]">
          {song.placeholder ? "Placeholder" : song.genre}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">{song.title}</h1>
        {song.duration || song.releaseDate ? (
          <p className="text-sm text-[#b7aa9a]">
            {[song.duration, song.releaseDate].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <p className="max-w-2xl leading-7 text-[#e7dccb]">{song.description}</p>
        {song.lyrics ? (
          <section aria-labelledby="lyrics-heading">
            <h2 id="lyrics-heading" className="text-sm uppercase tracking-[0.16em] text-[#d6b16a]">Lyrics</h2>
            <pre className="mt-3 whitespace-pre-wrap font-[family-name:var(--font-body)] text-sm leading-6 text-[#e7dccb]">{song.lyrics}</pre>
          </section>
        ) : null}
        {song.satireDisclaimer ? (
          <p className="rounded-md border border-[#d6b16a]/40 bg-[#d6b16a]/10 px-3 py-2 text-sm leading-6 text-[#f6e7c4]">
            {song.satireDisclaimer}
          </p>
        ) : null}
        <YoutubeEmbed youtubeId={song.youtubeId} title={song.title} />
        <AudioPlayer title={song.title} src={song.mp3Url} />
        <section aria-labelledby="streams-heading">
          <h2 id="streams-heading" className="text-sm uppercase tracking-[0.16em] text-[#d6b16a]">
            Streaming links
          </h2>
          {song.streaming && song.streaming.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-3">
              {song.streaming.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[#d9cbb8]">No streaming links have been added.</p>
          )}
        </section>
        <ShareBar title={song.title} path={`/music/${song.slug}`} />
        <p>
          <Link href="/music" className="text-sm text-[#e8c37a] underline underline-offset-4">
            Back to the catalog
          </Link>
        </p>
      </div>
    </article>
  );
}
