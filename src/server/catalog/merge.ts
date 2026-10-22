import { releases, withPlaceholders, type Song, type StreamingLink } from "@/content/songs";
import { youtubeIdFromUrl } from "@/lib/youtube";
import type { SongStatus } from "@/server/admin/constants";

export type CatalogSongRow = {
  slug: string;
  title: string;
  description: string;
  genre: string;
  lyrics: string | null;
  duration: string | null;
  release_date: string | null;
  youtube_url: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  artwork_url: string | null;
  artwork_note: string | null;
  mp3_url: string | null;
  status: SongStatus;
  featured: boolean;
  satire_disclaimer: string | null;
};

function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function mergeStreaming(row: CatalogSongRow, base: Song | undefined, youtubeUrl: string | undefined): StreamingLink[] {
  const links: StreamingLink[] = [];
  const add = (label: string, href: string | undefined) => {
    if (!href || links.some((link) => link.href === href)) return;
    links.push({ label, href });
  };
  add("YouTube", youtubeUrl);
  add("Spotify", text(row.spotify_url));
  add("Apple Music", text(row.apple_music_url));
  for (const link of base?.streaming ?? []) add(link.label, link.href);
  return links;
}

export function mergeReleasedSong(base: Song | undefined, row: CatalogSongRow): Song {
  const youtubeUrl = text(row.youtube_url) ?? (base?.youtubeId ? `https://youtu.be/${base.youtubeId}` : undefined);
  return {
    slug: base?.slug ?? row.slug,
    title: text(row.title) ?? base?.title ?? row.slug,
    description: text(row.description) ?? base?.description ?? "",
    genre: text(row.genre) ?? base?.genre ?? "",
    featured: row.featured || base?.featured || false,
    placeholder: false,
    youtubeId: youtubeIdFromUrl(youtubeUrl) ?? base?.youtubeId,
    mp3Url: text(row.mp3_url) ?? base?.mp3Url,
    artwork: text(row.artwork_url) ?? base?.artwork,
    artworkNote: text(row.artwork_note) ?? base?.artworkNote,
    streaming: mergeStreaming(row, base, youtubeUrl),
    satireDisclaimer: text(row.satire_disclaimer) ?? base?.satireDisclaimer,
    lyrics: text(row.lyrics) ?? base?.lyrics,
    duration: text(row.duration) ?? base?.duration,
    releaseDate: text(row.release_date) ?? base?.releaseDate,
  };
}

export function buildPublicCatalog(staticSongs: Song[], rows: CatalogSongRow[]): Song[] {
  const staticReleased = staticSongs.filter((song) => !song.placeholder);
  const bySlug = new Map(staticReleased.map((song) => [song.slug, song]));
  const hidden = new Set<string>();

  for (const row of rows) {
    if (row.status !== "published") {
      hidden.add(row.slug);
      bySlug.delete(row.slug);
      continue;
    }
    bySlug.set(row.slug, mergeReleasedSong(staticReleased.find((song) => song.slug === row.slug), row));
  }

  const staticOrder = staticReleased.map((song) => song.slug).filter((slug) => bySlug.has(slug) && !hidden.has(slug));
  const extras = [...bySlug.values()].filter((song) => !staticReleased.some((item) => item.slug === song.slug));
  const ordered = [...staticOrder.map((slug) => bySlug.get(slug)!), ...extras];
  const featured = ordered.find((song) => song.featured) ?? ordered[0];
  const normalized = ordered.map((song) => ({ ...song, featured: featured ? song.slug === featured.slug : false }));
  return withPlaceholders(normalized);
}

export function staticCatalogFloor(): Song[] {
  return releases.filter((song) => !song.placeholder);
}
