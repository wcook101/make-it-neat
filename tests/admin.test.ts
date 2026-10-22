import assert from "node:assert/strict";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";

import { songs } from "@/content/songs";
import { FUMPI_OUTLET_NAME, OMAR_SLUG, SESSION_COOKIE } from "@/server/admin/constants";
import { adminAccess } from "@/server/admin/access";
import { attemptLogin } from "@/server/admin/login";
import { hashPassword, isAdminConfigured, verifyPassword } from "@/server/admin/password";
import {
  createSong,
  createSubmission,
  listOutlets,
  listSongs,
  listSubmissions,
  recordFailedLogin,
  songBySlug,
  submissionsToCsv,
  updateSong,
} from "@/server/admin/records";
import { createSessionToken, verifySessionToken } from "@/server/admin/session";
import { addDays, todayIso, uploadStorageDecision, validateUpload } from "@/server/admin/validate";
import { buildPublicCatalog, type CatalogSongRow } from "@/server/catalog/merge";
import { ensureReady, setDatabaseForTests } from "@/server/db/index";
import { serializeDb, type Db } from "@/server/db/types";

const password = "correct horse battery";
const secret = "test-session-secret-with-32-characters";
let db: Db;
let passwordHash = "";

function originRequest(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("origin", new URL(url).origin);
  return new Request(url, { ...init, headers });
}

async function cookieFor(email = "admin@makeitneat.test"): Promise<string> {
  const token = await createSessionToken(email, secret);
  return `${SESSION_COOKIE}=${token}`;
}

test.before(async () => {
  passwordHash = hashPassword(password);
  process.env.ADMIN_EMAIL = "admin@makeitneat.test";
  process.env.ADMIN_PASSWORD_HASH = passwordHash;
  process.env.ADMIN_SESSION_SECRET = secret;
  process.env.ADMIN_DB_READY = "test";
  delete process.env.DATABASE_URL;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  const client = new PGlite();
  db = serializeDb({
    async query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
      const result = await client.query(text, params);
      return result.rows as T[];
    },
    async exec(script: string) {
      await client.exec(script);
    },
  });
  await ensureReady(db);
  setDatabaseForTests(db);
});

test("admin configuration and passwords stay server-side", () => {
  assert.equal(isAdminConfigured(), true);
  assert.equal(verifyPassword(password, passwordHash), true);
  assert.equal(verifyPassword("wrong-password", passwordHash), false);
  assert.equal(passwordHash.includes(password), false);
});

test("session tokens reject tampering and expiry", async () => {
  const token = await createSessionToken("admin@makeitneat.test", secret);
  assert.ok(await verifySessionToken(token, secret));
  assert.equal(await verifySessionToken(`${token}x`, secret), null);
  assert.equal(await verifySessionToken(token, `${secret}-other`), null);
  const expired = await createSessionToken("admin@makeitneat.test", secret, Date.now() - 13 * 60 * 60 * 1000);
  assert.equal(await verifySessionToken(expired, secret), null);
});

test("seed imports Omar once and does not invent a FuMP acceptance", async () => {
  await ensureReady(db);
  const catalog = await listSongs(db);
  assert.equal(catalog.filter((song) => song.slug === OMAR_SLUG).length, 1);
  const omar = catalog[0];
  assert.equal(omar.slug, OMAR_SLUG);
  assert.equal(omar.mp3_url, "/audio/omar-is-going-away.mp3");
  assert.equal(omar.youtube_url, "https://youtu.be/Oiug5ycMMEY");
  assert.equal(omar.lyrics, null);
  assert.equal(omar.duration, null);
  assert.equal(omar.release_date, null);
  const submissions = await listSubmissions(db, { today: todayIso(), until: addDays(todayIso(), 14) });
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].outlet_name, FUMPI_OUTLET_NAME);
  assert.equal(submissions[0].status, "awaiting_response");
  assert.equal(submissions[0].date_submitted, null);
  assert.notEqual(submissions[0].status, "accepted");
  assert.notEqual(submissions[0].status, "published");
  await updateSong(db, omar.id, {
    slug: omar.slug,
    title: "Omar Edited",
    description: omar.description,
    genre: omar.genre,
    lyrics: null,
    duration: null,
    releaseDate: null,
    youtubeUrl: omar.youtube_url,
    spotifyUrl: null,
    appleMusicUrl: null,
    artworkUrl: omar.artwork_url,
    artworkNote: omar.artwork_note,
    mp3Url: omar.mp3_url,
    status: "published",
    featured: true,
    satireDisclaimer: omar.satire_disclaimer,
  });
  await ensureReady(db);
  assert.equal((await songBySlug(db, OMAR_SLUG))?.title, "Omar Edited");
  await updateSong(db, omar.id, {
    slug: omar.slug,
    title: "Omar Is Going Away",
    description: omar.description,
    genre: omar.genre,
    lyrics: null,
    duration: null,
    releaseDate: null,
    youtubeUrl: omar.youtube_url,
    spotifyUrl: null,
    appleMusicUrl: null,
    artworkUrl: omar.artwork_url,
    artworkNote: omar.artwork_note,
    mp3Url: omar.mp3_url,
    status: "published",
    featured: true,
    satireDisclaimer: omar.satire_disclaimer,
  });
});

test("unauthenticated requests cannot read or change admin data", async () => {
  assert.equal((await adminAccess(originRequest("http://localhost/api/admin/songs")))?.status, 401);
  assert.equal((await adminAccess(originRequest("http://localhost/api/admin/songs", { method: "POST", body: new FormData() })))?.status, 401);
  assert.equal((await adminAccess(originRequest("http://localhost/api/admin/submissions/export")))?.status, 401);
  const forged = originRequest("http://localhost/api/admin/songs", { headers: { cookie: `${SESSION_COOKIE}=forged.token` } });
  assert.equal((await adminAccess(forged))?.status, 401);
});

test("a signed-in admin can create, edit, and archive a song", async () => {
  const cookie = await cookieFor();
  assert.equal(await adminAccess(originRequest("http://localhost/api/admin/songs", { method: "POST", headers: { cookie } })), null);
  const saved = await createSong(db, {
    slug: "second-story",
    title: "Second Story",
    description: "A finished test song.",
    genre: "Comedy",
    lyrics: null,
    duration: null,
    releaseDate: null,
    youtubeUrl: null,
    spotifyUrl: null,
    appleMusicUrl: null,
    artworkUrl: null,
    artworkNote: null,
    mp3Url: "https://example.com/second-story.mp3",
    status: "published",
    featured: false,
    satireDisclaimer: null,
  });
  assert.equal(saved.slug, "second-story");
  await updateSong(db, saved.id, {
    slug: saved.slug,
    title: saved.title,
    description: saved.description,
    genre: saved.genre,
    lyrics: null,
    duration: null,
    releaseDate: null,
    youtubeUrl: null,
    spotifyUrl: null,
    appleMusicUrl: null,
    artworkUrl: null,
    artworkNote: null,
    mp3Url: saved.mp3_url,
    status: "archived",
    featured: false,
    satireDisclaimer: null,
  });
  const row: CatalogSongRow = {
    slug: "second-story",
    title: "Second Story",
    description: "A finished test song.",
    genre: "Comedy",
    lyrics: null,
    duration: null,
    release_date: null,
    youtube_url: null,
    spotify_url: null,
    apple_music_url: null,
    artwork_url: null,
    artwork_note: null,
    mp3_url: "https://example.com/second-story.mp3",
    status: "archived",
    featured: false,
    satire_disclaimer: null,
  };
  const omar = (await listSongs(db)).find((song) => song.slug === OMAR_SLUG)!;
  const catalog = buildPublicCatalog(songs, [
    { ...row },
    {
      slug: omar.slug,
      title: omar.title,
      description: omar.description,
      genre: omar.genre,
      lyrics: null,
      duration: null,
      release_date: null,
      youtube_url: omar.youtube_url,
      spotify_url: null,
      apple_music_url: null,
      artwork_url: null,
      artwork_note: null,
      mp3_url: null,
      status: "published",
      featured: true,
      satire_disclaimer: null,
    },
  ]);
  assert.equal(catalog.some((song) => song.slug === "second-story"), false);
  const publicOmar = catalog.find((song) => song.slug === OMAR_SLUG);
  assert.equal(publicOmar?.mp3Url, "/audio/omar-is-going-away.mp3");
  assert.equal(publicOmar?.youtubeId, "Oiug5ycMMEY");
});

test("cross-site posts are rejected and uploads are not written locally", async () => {
  const cookie = await cookieFor();
  const blocked = await adminAccess(new Request("http://localhost/api/admin/songs", {
    method: "POST",
    headers: { origin: "https://evil.example", cookie },
  }));
  assert.equal(blocked?.status, 403);
  const problem = validateUpload("audio", { type: "audio/mpeg", size: 4, name: "omar.mp3" });
  assert.equal(uploadStorageDecision(problem, false)?.status, 503);
  assert.equal(validateUpload("audio", { type: "application/octet-stream", size: 100, name: "bad.exe" }), "Audio uploads must be MP3 files.");
  assert.match(validateUpload("audio", { type: "audio/mpeg", size: 40 * 1024 * 1024, name: "big.mp3" }) ?? "", /30 MB/);
  assert.equal(validateUpload("image", { type: "image/svg+xml", size: 100, name: "art.svg" }), "Cover art must be a JPEG, PNG, or WebP image.");
});

test("submission search, overdue follow-ups, and CSV export work", async () => {
  const omar = await songBySlug(db, OMAR_SLUG);
  const outlets = await listOutlets(db);
  const yesterday = addDays(todayIso(), -1);
  await createSong(db, {
    slug: "follow-up-song",
    title: "Follow Up Song",
    description: "Used only to test follow-up filtering.",
    genre: "Comedy",
    lyrics: null,
    duration: null,
    releaseDate: null,
    youtubeUrl: null,
    spotifyUrl: null,
    appleMusicUrl: null,
    artworkUrl: null,
    artworkNote: null,
    mp3Url: null,
    status: "draft",
    featured: false,
    satireDisclaimer: null,
  });
  const extra = await songBySlug(db, "follow-up-song");
  await createSubmission(db, {
    songId: extra!.id,
    outletId: outlets[0].id,
    contactName: null,
    contactEmail: null,
    submissionUrl: null,
    dateSubmitted: null,
    status: "submitted",
    followUpDate: yesterday,
    notes: "=spreadsheet",
    responseDate: null,
    responseDetails: null,
    publishedUrl: null,
  });
  const overdue = await listSubmissions(db, { due: "overdue", today: todayIso(), until: addDays(todayIso(), 14) });
  assert.equal(overdue.some((item) => item.song_title === "Follow Up Song"), true);
  assert.equal(overdue.some((item) => item.outlet_name === FUMPI_OUTLET_NAME && item.status === "awaiting_response" && !item.follow_up_date), false);
  const csv = submissionsToCsv(await listSubmissions(db, { today: todayIso(), until: addDays(todayIso(), 14) }));
  assert.match(csv, /The FuMP Sideshow/);
  assert.match(csv, /Omar Is Going Away/);
  assert.match(csv, /'=spreadsheet/);
  assert.equal(omar?.mp3_url, "/audio/omar-is-going-away.mp3");
});

test("repeated sign-in failures are throttled", async () => {
  for (let attempt = 0; attempt < 8; attempt += 1) await recordFailedLogin(db, "blocked@example.com");
  const blocked = await attemptLogin({ email: "blocked@example.com", password });
  assert.equal(blocked.status, 429);
});

test("the real admin can sign in", async () => {
  const response = await attemptLogin({ email: "admin@makeitneat.test", password });
  assert.equal(response.status, 200);
  assert.ok(response.token);
  const allowed = await adminAccess(originRequest("http://localhost/api/admin/songs", {
    headers: { cookie: `${SESSION_COOKIE}=${response.token}` },
  }));
  assert.equal(allowed, null);
});

test("csv cells are quoted", () => {
  const csv = submissionsToCsv([]);
  assert.match(csv, /^song,outlet,/);
});
