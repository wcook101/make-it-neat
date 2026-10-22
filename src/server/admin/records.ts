import { randomUUID } from "node:crypto";

import {
  OPEN_SUBMISSION_STATUSES,
  PENDING_RESPONSE_STATUSES,
  type SongStatus,
  type SubmissionStatus,
} from "@/server/admin/constants";
import type { SongInput, OutletInput, SubmissionInput } from "@/server/admin/validate";
import type { Db } from "@/server/db/types";

export type SongRecord = {
  id: string;
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
  created_at: string;
  updated_at: string;
};

export type OutletRecord = {
  id: string;
  name: string;
  website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionRecord = {
  id: string;
  song_id: string;
  outlet_id: string;
  song_title: string;
  outlet_name: string;
  contact_name: string | null;
  contact_email: string | null;
  submission_url: string | null;
  date_submitted: string | null;
  status: SubmissionStatus;
  follow_up_date: string | null;
  notes: string | null;
  response_date: string | null;
  response_details: string | null;
  published_url: string | null;
  created_at: string;
  updated_at: string;
};

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === "t" || value === "true";
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function mapSong(row: Record<string, unknown>): SongRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description ?? ""),
    genre: String(row.genre ?? ""),
    lyrics: asText(row.lyrics),
    duration: asText(row.duration),
    release_date: asText(row.release_date),
    youtube_url: asText(row.youtube_url),
    spotify_url: asText(row.spotify_url),
    apple_music_url: asText(row.apple_music_url),
    artwork_url: asText(row.artwork_url),
    artwork_note: asText(row.artwork_note),
    mp3_url: asText(row.mp3_url),
    status: String(row.status) as SongStatus,
    featured: asBool(row.featured),
    satire_disclaimer: asText(row.satire_disclaimer),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

const SUBMISSION_SELECT = `
  SELECT submissions.*, songs.title AS song_title, outlets.name AS outlet_name
  FROM submissions
  JOIN songs ON songs.id = submissions.song_id
  JOIN outlets ON outlets.id = submissions.outlet_id
`;

function mapSubmission(row: Record<string, unknown>): SubmissionRecord {
  return {
    id: String(row.id),
    song_id: String(row.song_id),
    outlet_id: String(row.outlet_id),
    song_title: String(row.song_title),
    outlet_name: String(row.outlet_name),
    contact_name: asText(row.contact_name),
    contact_email: asText(row.contact_email),
    submission_url: asText(row.submission_url),
    date_submitted: asText(row.date_submitted),
    status: String(row.status) as SubmissionStatus,
    follow_up_date: asText(row.follow_up_date),
    notes: asText(row.notes),
    response_date: asText(row.response_date),
    response_details: asText(row.response_details),
    published_url: asText(row.published_url),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listSongs(db: Db): Promise<SongRecord[]> {
  const rows = await db.query("SELECT * FROM songs ORDER BY featured DESC, title ASC");
  return rows.map(mapSong);
}

export async function songById(db: Db, id: string): Promise<SongRecord | null> {
  const rows = await db.query("SELECT * FROM songs WHERE id = $1", [id]);
  return rows[0] ? mapSong(rows[0]) : null;
}

export async function songBySlug(db: Db, slug: string): Promise<SongRecord | null> {
  const rows = await db.query("SELECT * FROM songs WHERE slug = $1", [slug]);
  return rows[0] ? mapSong(rows[0]) : null;
}

async function clearOtherFeatured(db: Db, id: string): Promise<void> {
  await db.query("UPDATE songs SET featured = FALSE, updated_at = NOW() WHERE featured = TRUE AND id <> $1", [id]);
}

export async function createSong(db: Db, input: SongInput): Promise<SongRecord> {
  const id = randomUUID();
  if (input.featured) await clearOtherFeatured(db, id);
  const rows = await db.query(
    `INSERT INTO songs (
      id, slug, title, description, genre, lyrics, duration, release_date, youtube_url,
      spotify_url, apple_music_url, artwork_url, artwork_note, mp3_url, status, featured, satire_disclaimer
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
    ) RETURNING *`,
    [
      id, input.slug, input.title, input.description, input.genre, input.lyrics, input.duration, input.releaseDate,
      input.youtubeUrl, input.spotifyUrl, input.appleMusicUrl, input.artworkUrl, input.artworkNote, input.mp3Url,
      input.status, input.featured, input.satireDisclaimer,
    ],
  );
  return mapSong(rows[0]);
}

export async function updateSong(db: Db, id: string, input: SongInput): Promise<SongRecord | null> {
  if (input.featured) await clearOtherFeatured(db, id);
  const rows = await db.query(
    `UPDATE songs SET
      slug = $2, title = $3, description = $4, genre = $5, lyrics = $6, duration = $7, release_date = $8,
      youtube_url = $9, spotify_url = $10, apple_music_url = $11, artwork_url = $12, artwork_note = $13,
      mp3_url = $14, status = $15, featured = $16, satire_disclaimer = $17, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [
      id, input.slug, input.title, input.description, input.genre, input.lyrics, input.duration, input.releaseDate,
      input.youtubeUrl, input.spotifyUrl, input.appleMusicUrl, input.artworkUrl, input.artworkNote, input.mp3Url,
      input.status, input.featured, input.satireDisclaimer,
    ],
  );
  return rows[0] ? mapSong(rows[0]) : null;
}

export async function setSongFile(db: Db, id: string, field: "mp3_url" | "artwork_url", url: string): Promise<void> {
  if (field !== "mp3_url" && field !== "artwork_url") return;
  await db.query(`UPDATE songs SET ${field} = $2, updated_at = NOW() WHERE id = $1`, [id, url]);
}

export async function listOutlets(db: Db): Promise<OutletRecord[]> {
  const rows = await db.query("SELECT * FROM outlets ORDER BY name ASC");
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    website: asText(row.website),
    contact_name: asText(row.contact_name),
    contact_email: asText(row.contact_email),
    notes: asText(row.notes),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }));
}

export async function outletById(db: Db, id: string): Promise<OutletRecord | null> {
  const rows = await listOutlets(db);
  return rows.find((outlet) => outlet.id === id) ?? null;
}

export async function createOutlet(db: Db, input: OutletInput): Promise<OutletRecord> {
  const id = randomUUID();
  await db.query(
    `INSERT INTO outlets (id, name, website, contact_name, contact_email, notes) VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, input.name, input.website, input.contactName, input.contactEmail, input.notes],
  );
  const outlet = await outletById(db, id);
  if (!outlet) throw new Error("Outlet was not saved");
  return outlet;
}

export async function updateOutlet(db: Db, id: string, input: OutletInput): Promise<void> {
  await db.query(
    `UPDATE outlets SET name = $2, website = $3, contact_name = $4, contact_email = $5, notes = $6, updated_at = NOW() WHERE id = $1`,
    [id, input.name, input.website, input.contactName, input.contactEmail, input.notes],
  );
}

const SORTS = {
  follow_up_date: "submissions.follow_up_date",
  date_submitted: "submissions.date_submitted",
  status: "submissions.status",
  updated_at: "submissions.updated_at",
  outlet: "outlets.name",
  song: "songs.title",
} as const;

export type SubmissionQuery = {
  search?: string;
  status?: string;
  outletId?: string;
  due?: string;
  sort?: string;
  dir?: string;
  today: string;
  until: string;
};

export async function listSubmissions(db: Db, query: SubmissionQuery): Promise<SubmissionRecord[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    where.push(sql.replace("?", `$${params.length}`));
  };
  if (query.search) {
    const term = `%${query.search.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    params.push(term);
    const index = `$${params.length}`;
    where.push(`(
      songs.title ILIKE ${index} ESCAPE '\\' OR outlets.name ILIKE ${index} ESCAPE '\\' OR COALESCE(submissions.notes, '') ILIKE ${index} ESCAPE '\\'
      OR COALESCE(submissions.contact_name, '') ILIKE ${index} ESCAPE '\\' OR COALESCE(submissions.contact_email, '') ILIKE ${index} ESCAPE '\\'
      OR COALESCE(submissions.submission_url, '') ILIKE ${index} ESCAPE '\\' OR COALESCE(submissions.published_url, '') ILIKE ${index} ESCAPE '\\'
    )`);
  }
  if (query.status && query.status !== "all") add("submissions.status = ?", query.status);
  if (query.outletId) add("submissions.outlet_id = ?", query.outletId);
  if (query.due === "overdue") {
    add("submissions.follow_up_date IS NOT NULL AND submissions.follow_up_date < ?", query.today);
    where.push(`submissions.status IN (${OPEN_SUBMISSION_STATUSES.map((status) => `'${status}'`).join(", ")})`);
  } else if (query.due === "upcoming") {
    add("submissions.follow_up_date IS NOT NULL AND submissions.follow_up_date >= ?", query.today);
    add("submissions.follow_up_date <= ?", query.until);
    where.push(`submissions.status IN (${OPEN_SUBMISSION_STATUSES.map((status) => `'${status}'`).join(", ")})`);
  }
  const sort = SORTS[query.sort as keyof typeof SORTS] ?? "submissions.updated_at";
  const direction = query.dir === "asc" ? "ASC" : "DESC";
  const rows = await db.query(
    `${SUBMISSION_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${sort} ${direction} NULLS LAST, submissions.created_at DESC`,
    params,
  );
  return rows.map(mapSubmission);
}

export async function submissionById(db: Db, id: string): Promise<SubmissionRecord | null> {
  const rows = await db.query(`${SUBMISSION_SELECT} WHERE submissions.id = $1`, [id]);
  return rows[0] ? mapSubmission(rows[0]) : null;
}

export async function createSubmission(db: Db, input: SubmissionInput): Promise<string> {
  const id = randomUUID();
  await db.query(
    `INSERT INTO submissions (
      id, song_id, outlet_id, contact_name, contact_email, submission_url, date_submitted, status,
      follow_up_date, notes, response_date, response_details, published_url
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      id, input.songId, input.outletId, input.contactName, input.contactEmail, input.submissionUrl, input.dateSubmitted,
      input.status, input.followUpDate, input.notes, input.responseDate, input.responseDetails, input.publishedUrl,
    ],
  );
  return id;
}

export async function updateSubmission(db: Db, id: string, input: SubmissionInput): Promise<void> {
  await db.query(
    `UPDATE submissions SET
      song_id = $2, outlet_id = $3, contact_name = $4, contact_email = $5, submission_url = $6, date_submitted = $7,
      status = $8, follow_up_date = $9, notes = $10, response_date = $11, response_details = $12, published_url = $13,
      updated_at = NOW()
     WHERE id = $1`,
    [
      id, input.songId, input.outletId, input.contactName, input.contactEmail, input.submissionUrl, input.dateSubmitted,
      input.status, input.followUpDate, input.notes, input.responseDate, input.responseDetails, input.publishedUrl,
    ],
  );
}

export async function dashboardStats(db: Db, today: string, until: string) {
  const count = async (sql: string, params: unknown[] = []) => {
    const rows = await db.query<{ count: number | string }>(sql, params);
    return Number(rows[0]?.count ?? 0);
  };
  const openList = OPEN_SUBMISSION_STATUSES.map((status) => `'${status}'`).join(", ");
  const pendingList = PENDING_RESPONSE_STATUSES.map((status) => `'${status}'`).join(", ");
  const [songs, publishedSongs, submissions, accepted, pending, statusRows, outletRows, recent, followUps] = await Promise.all([
    count("SELECT COUNT(*)::int AS count FROM songs"),
    count("SELECT COUNT(*)::int AS count FROM songs WHERE status = 'published'"),
    count("SELECT COUNT(*)::int AS count FROM submissions"),
    count("SELECT COUNT(*)::int AS count FROM submissions WHERE status = 'accepted'"),
    count(`SELECT COUNT(*)::int AS count FROM submissions WHERE status IN (${pendingList})`),
    db.query<{ status: string; count: number | string }>("SELECT status, COUNT(*)::int AS count FROM submissions GROUP BY status"),
    db.query<{ name: string; count: number | string }>(
      `SELECT outlets.name, COUNT(submissions.id)::int AS count
       FROM outlets LEFT JOIN submissions ON submissions.outlet_id = outlets.id
       GROUP BY outlets.name ORDER BY outlets.name ASC`,
    ),
    db.query(`${SUBMISSION_SELECT} ORDER BY submissions.created_at DESC LIMIT 8`),
    db.query(
      `${SUBMISSION_SELECT}
       WHERE submissions.follow_up_date IS NOT NULL
         AND submissions.status IN (${openList})
         AND submissions.follow_up_date <= $1
       ORDER BY submissions.follow_up_date ASC`,
      [until],
    ),
  ]);
  return {
    songs,
    publishedSongs,
    submissions,
    accepted,
    pending,
    byStatus: statusRows.map((row) => ({ label: String(row.status), count: Number(row.count) })),
    byOutlet: outletRows.map((row) => ({ label: String(row.name), count: Number(row.count) })),
    recent: recent.map(mapSubmission),
    followUps: followUps.map(mapSubmission).map((item) => ({
      ...item,
      overdue: Boolean(item.follow_up_date && item.follow_up_date < today),
    })),
  };
}

export async function recordFailedLogin(db: Db, key: string): Promise<void> {
  await db.query("INSERT INTO login_attempts (id, attempt_key) VALUES ($1, $2)", [randomUUID(), key]);
}

export async function failedLoginCount(db: Db, key: string, sinceIso: string): Promise<number> {
  const rows = await db.query<{ count: number | string }>(
    "SELECT COUNT(*)::int AS count FROM login_attempts WHERE attempt_key = $1 AND created_at >= $2",
    [key, sinceIso],
  );
  return Number(rows[0]?.count ?? 0);
}

export function csvEscape(value: string | null): string {
  const raw = value ?? "";
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function submissionsToCsv(rows: SubmissionRecord[]): string {
  const headers = [
    "song", "outlet", "contact_name", "contact_email", "submission_url", "date_submitted", "status",
    "follow_up_date", "notes", "response_date", "response_details", "published_url",
  ];
  const lines = rows.map((row) =>
    [
      row.song_title, row.outlet_name, row.contact_name, row.contact_email, row.submission_url, row.date_submitted,
      row.status, row.follow_up_date, row.notes, row.response_date, row.response_details, row.published_url,
    ].map(csvEscape).join(","),
  );
  return [headers.join(","), ...lines].join("\r\n");
}
