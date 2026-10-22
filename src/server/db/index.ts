import { randomUUID } from "node:crypto";

import { releases } from "@/content/songs";
import { FUMPI_OUTLET_NAME, OMAR_SLUG } from "@/server/admin/constants";
import { MIGRATION_ID, SCHEMA_SQL } from "@/server/db/schema";
import { serializeDb, sqlStatements, type Db } from "@/server/db/types";

let testDb: Db | null = null;
let productionDb: Promise<Db> | null = null;

export function setDatabaseForTests(db: Db | null): void {
  testDb = db;
  productionDb = null;
}

export async function ensureReady(db: Db): Promise<void> {
  for (const statement of sqlStatements(SCHEMA_SQL)) {
    await db.exec(statement);
  }
  await db.query(
    "INSERT INTO schema_migrations (id) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM schema_migrations WHERE id = $1)",
    [MIGRATION_ID],
  );
  await seedCatalog(db);
}

export async function seedCatalog(db: Db): Promise<void> {
  for (const song of releases) {
    if (song.placeholder) continue;
    await db.query(
      `INSERT INTO songs (
        id, slug, title, description, genre, lyrics, duration, release_date,
        youtube_url, spotify_url, apple_music_url, artwork_url, artwork_note, mp3_url,
        status, featured, satire_disclaimer
      )
      SELECT $1, $2, $3, $4, $5, NULL, NULL, NULL, $6, NULL, NULL, $7, $8, $9, 'published', $10, $11
      WHERE NOT EXISTS (SELECT 1 FROM songs WHERE slug = $2)`,
      [
        randomUUID(),
        song.slug,
        song.title,
        song.description,
        song.genre,
        song.youtubeId ? `https://youtu.be/${song.youtubeId}` : null,
        song.artwork ?? null,
        song.artworkNote ?? null,
        song.mp3Url ?? null,
        Boolean(song.featured),
        song.satireDisclaimer ?? null,
      ],
    );
  }

  await db.query(
    `INSERT INTO outlets (id, name)
     SELECT $1, $2
     WHERE NOT EXISTS (SELECT 1 FROM outlets WHERE name = $2)`,
    [randomUUID(), FUMPI_OUTLET_NAME],
  );

  await db.query(
    `INSERT INTO submissions (id, song_id, outlet_id, status)
     SELECT $1, songs.id, outlets.id, 'awaiting_response'
     FROM songs, outlets
     WHERE songs.slug = $2 AND outlets.name = $3
       AND NOT EXISTS (
         SELECT 1 FROM submissions
         WHERE submissions.song_id = songs.id AND submissions.outlet_id = outlets.id
       )`,
    [randomUUID(), OMAR_SLUG, FUMPI_OUTLET_NAME],
  );
}

async function openProduction(): Promise<Db> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const { default: postgres } = await import("postgres");
  const sql = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
    ssl: "require",
  });
  const db: Db = {
    async query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
      const rows = await sql.unsafe(text, params as never[]);
      return [...rows] as T[];
    },
    async exec(script: string) {
      await sql.unsafe(script);
    },
  };
  const safe = serializeDb(db);
  await ensureReady(safe);
  return safe;
}

export async function getDb(): Promise<Db> {
  if (testDb) return testDb;
  if (!productionDb) {
    productionDb = openProduction().catch((error: unknown) => {
      productionDb = null;
      throw error;
    });
  }
  return productionDb;
}
