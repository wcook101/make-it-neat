import { isDirectMp3 } from "@/lib/audio";
import { youtubeIdFromUrl } from "@/lib/youtube";
import {
  MAX_AUDIO_BYTES,
  MAX_IMAGE_BYTES,
  SONG_STATUSES,
  SUBMISSION_STATUSES,
  type SongStatus,
  type SubmissionStatus,
} from "@/server/admin/constants";

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function emptyToNull(value: FormDataEntryValue | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isHttpsOrSitePath(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isDate(value: string | null): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isEmail(value: string | null): boolean {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type SongInput = {
  slug: string;
  title: string;
  description: string;
  genre: string;
  lyrics: string | null;
  duration: string | null;
  releaseDate: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  artworkUrl: string | null;
  artworkNote: string | null;
  mp3Url: string | null;
  status: SongStatus;
  featured: boolean;
  satireDisclaimer: string | null;
};

export function parseSongForm(form: FormData): { ok: true; value: SongInput } | { ok: false; error: string } {
  const title = emptyToNull(form.get("title"));
  const description = emptyToNull(form.get("description"));
  const genre = emptyToNull(form.get("genre"));
  const slug = slugify(emptyToNull(form.get("slug")) ?? title ?? "");
  const status = emptyToNull(form.get("status")) ?? "draft";
  if (!title || !description || !genre || !slug) return { ok: false, error: "Title, description, genre, and slug are required." };
  if (!SONG_STATUSES.includes(status as SongStatus)) return { ok: false, error: "Choose a valid publication status." };
  const duration = emptyToNull(form.get("duration"));
  if (duration && !/^\d{1,3}:[0-5]\d$/.test(duration)) return { ok: false, error: "Duration must look like 3:46." };
  const releaseDate = emptyToNull(form.get("releaseDate"));
  if (!isDate(releaseDate)) return { ok: false, error: "Release date must be a real calendar date." };
  const youtubeUrl = emptyToNull(form.get("youtubeUrl"));
  if (youtubeUrl && !youtubeIdFromUrl(youtubeUrl)) return { ok: false, error: "YouTube URL must be a video link." };
  const spotifyUrl = emptyToNull(form.get("spotifyUrl"));
  const appleMusicUrl = emptyToNull(form.get("appleMusicUrl"));
  const artworkUrl = emptyToNull(form.get("artworkUrl"));
  const mp3Url = emptyToNull(form.get("mp3Url"));
  for (const url of [spotifyUrl, appleMusicUrl, artworkUrl]) {
    if (url && !isHttpsOrSitePath(url)) return { ok: false, error: "Links must be HTTPS or a site path." };
  }
  if (mp3Url && !isDirectMp3(mp3Url)) return { ok: false, error: "MP3 URL must be a direct audio file, not a video page." };
  return {
    ok: true,
    value: {
      slug,
      title,
      description,
      genre,
      lyrics: emptyToNull(form.get("lyrics")),
      duration,
      releaseDate,
      youtubeUrl,
      spotifyUrl,
      appleMusicUrl,
      artworkUrl,
      artworkNote: emptyToNull(form.get("artworkNote")),
      mp3Url,
      status: status as SongStatus,
      featured: form.get("featured") === "on",
      satireDisclaimer: emptyToNull(form.get("satireDisclaimer")),
    },
  };
}

export type OutletInput = {
  name: string;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
};

export function parseOutletForm(form: FormData): { ok: true; value: OutletInput } | { ok: false; error: string } {
  const name = emptyToNull(form.get("name"));
  if (!name) return { ok: false, error: "Outlet name is required." };
  const website = emptyToNull(form.get("website"));
  if (website && !isHttpsOrSitePath(website)) return { ok: false, error: "Website must be an HTTPS link." };
  const contactEmail = emptyToNull(form.get("contactEmail"));
  if (!isEmail(contactEmail)) return { ok: false, error: "Contact email is not valid." };
  return {
    ok: true,
    value: {
      name,
      website,
      contactName: emptyToNull(form.get("contactName")),
      contactEmail,
      notes: emptyToNull(form.get("notes")),
    },
  };
}

export type SubmissionInput = {
  songId: string;
  outletId: string;
  contactName: string | null;
  contactEmail: string | null;
  submissionUrl: string | null;
  dateSubmitted: string | null;
  status: SubmissionStatus;
  followUpDate: string | null;
  notes: string | null;
  responseDate: string | null;
  responseDetails: string | null;
  publishedUrl: string | null;
};

export function parseSubmissionForm(form: FormData): { ok: true; value: SubmissionInput } | { ok: false; error: string } {
  const songId = emptyToNull(form.get("songId"));
  const outletId = emptyToNull(form.get("outletId"));
  const status = emptyToNull(form.get("status")) ?? "researching";
  if (!songId || !outletId) return { ok: false, error: "Choose a song and an outlet." };
  if (!SUBMISSION_STATUSES.includes(status as SubmissionStatus)) return { ok: false, error: "Choose a valid submission status." };
  const contactEmail = emptyToNull(form.get("contactEmail"));
  if (!isEmail(contactEmail)) return { ok: false, error: "Contact email is not valid." };
  const dateSubmitted = emptyToNull(form.get("dateSubmitted"));
  const followUpDate = emptyToNull(form.get("followUpDate"));
  const responseDate = emptyToNull(form.get("responseDate"));
  if (![dateSubmitted, followUpDate, responseDate].every(isDate)) return { ok: false, error: "Dates must be real calendar dates." };
  const submissionUrl = emptyToNull(form.get("submissionUrl"));
  const publishedUrl = emptyToNull(form.get("publishedUrl"));
  if ((submissionUrl && !isHttpsOrSitePath(submissionUrl)) || (publishedUrl && !isHttpsOrSitePath(publishedUrl))) {
    return { ok: false, error: "URLs must be HTTPS or a site path." };
  }
  return {
    ok: true,
    value: {
      songId,
      outletId,
      contactName: emptyToNull(form.get("contactName")),
      contactEmail,
      submissionUrl,
      dateSubmitted,
      status: status as SubmissionStatus,
      followUpDate,
      notes: emptyToNull(form.get("notes")),
      responseDate,
      responseDetails: emptyToNull(form.get("responseDetails")),
      publishedUrl,
    },
  };
}

export function uploadStorageDecision(problem: string | null, tokenPresent: boolean): { status: 400 | 503; error: string } | null {
  if (problem) return { status: 400, error: problem };
  if (!tokenPresent) return { status: 503, error: "File storage is not configured." };
  return null;
}

export function validateUpload(kind: "audio" | "image", file: { type: string; size: number; name: string }): string | null {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  if (kind === "audio") {
    const typeOk = file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "";
    if (extension !== "mp3" || !typeOk) return "Audio uploads must be MP3 files.";
    if (file.size <= 0 || file.size > MAX_AUDIO_BYTES) return "MP3 files must be under 30 MB.";
    return null;
  }
  const imageTypes: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  const expected = imageTypes[extension];
  if (!expected || (file.type && file.type !== expected)) return "Cover art must be a JPEG, PNG, or WebP image.";
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return "Images must be under 8 MB.";
  return null;
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
