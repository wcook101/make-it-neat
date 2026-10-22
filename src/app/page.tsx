import Link from "next/link";

import { AudioPlayer } from "@/components/audio-player";
import { SongArt } from "@/components/song-art";
import { SongCard } from "@/components/song-card";
import { site } from "@/content/site";
import { CATALOG_SIZE } from "@/content/songs";
import { getCatalog } from "@/server/catalog/load";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalog = await getCatalog();
  const featured = catalog.find((song) => song.featured && !song.placeholder) ?? catalog[0];
  const latest = catalog.filter((song) => !song.placeholder && song.slug !== featured.slug);
  const openSlots = catalog.filter((song) => song.placeholder).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-[#d6b16a]">{site.artist}</p>
      <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-none text-white sm:text-7xl">
        {site.tagline}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[#e7dccb]">
        Make It Neat writes songs as stories. The music is produced with AI assistance and released as finished recordings, including comedy and political satire.
      </p>

      <section aria-labelledby="featured-heading" className="mt-12 grid gap-6 rounded-3xl border border-white/10 bg-[#120e0b] p-4 sm:p-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <SongArt song={featured} priority />
        <div className="flex flex-col justify-center gap-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#d6b16a]">Featured release</p>
          <h2 id="featured-heading" className="font-[family-name:var(--font-display)] text-4xl text-white sm:text-5xl">
            {featured.title}
          </h2>
          <p className="text-sm uppercase tracking-[0.14em] text-[#b7aa9a]">{featured.genre}</p>
          <p className="max-w-xl leading-7 text-[#e7dccb]">{featured.description}</p>
          {featured.satireDisclaimer ? (
            <p className="rounded-md border border-[#d6b16a]/40 bg-[#d6b16a]/10 px-3 py-2 text-sm leading-6 text-[#f6e7c4]">
              {featured.satireDisclaimer}
            </p>
          ) : null}
          <AudioPlayer title={featured.title} src={featured.mp3Url} />
          <div className="flex flex-wrap gap-3">
            <Link href={`/music/${featured.slug}`} className="rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]">
              Open song page
            </Link>
            <Link href="/music" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
              Browse the catalog
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="latest-heading" className="mt-16">
        <h2 id="latest-heading" className="font-[family-name:var(--font-display)] text-4xl text-white">
          Latest songs
        </h2>
        {latest.length === 0 ? (
          <p className="mt-4 max-w-2xl leading-7 text-[#d9cbb8]">
            {featured.title} is the only finished song in the catalog. {openSlots} of {CATALOG_SIZE} slots are placeholders waiting for titles, artwork, and MP3 files.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((song) => (
              <SongCard key={song.slug} song={song} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
