import { cache } from "react";

import { songs, type Song } from "@/content/songs";
import { buildPublicCatalog, type CatalogSongRow } from "@/server/catalog/merge";
import { listSongs } from "@/server/admin/records";
import { getDb } from "@/server/db/index";

export const getCatalog = cache(async (): Promise<Song[]> => {
  if (!process.env.DATABASE_URL && process.env.ADMIN_DB_READY !== "test") return songs;
  try {
    const db = await getDb();
    const rows = await listSongs(db);
    const catalogRows: CatalogSongRow[] = rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      genre: row.genre,
      lyrics: row.lyrics,
      duration: row.duration,
      release_date: row.release_date,
      youtube_url: row.youtube_url,
      spotify_url: row.spotify_url,
      apple_music_url: row.apple_music_url,
      artwork_url: row.artwork_url,
      artwork_note: row.artwork_note,
      mp3_url: row.mp3_url,
      status: row.status,
      featured: row.featured,
      satire_disclaimer: row.satire_disclaimer,
    }));
    return buildPublicCatalog(songs, catalogRows);
  } catch {
    console.error("Catalog database unavailable");
    return songs;
  }
});

export async function getPublicSong(slug: string): Promise<Song | undefined> {
  const catalog = await getCatalog();
  return catalog.find((song) => song.slug === slug);
}
