export const MIGRATION_ID = "001_admin";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  lyrics TEXT,
  duration TEXT,
  release_date TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  artwork_url TEXT,
  artwork_note TEXT,
  mp3_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  satire_disclaimer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outlets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  song_id TEXT NOT NULL REFERENCES songs(id),
  outlet_id TEXT NOT NULL REFERENCES outlets(id),
  contact_name TEXT,
  contact_email TEXT,
  submission_url TEXT,
  date_submitted TEXT,
  status TEXT NOT NULL CHECK (status IN (
    'researching',
    'ready_to_submit',
    'submitted',
    'awaiting_response',
    'accepted',
    'rejected',
    'published'
  )),
  follow_up_date TEXT,
  notes TEXT,
  response_date TEXT,
  response_details TEXT,
  published_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submissions_song_idx ON submissions (song_id);
CREATE INDEX IF NOT EXISTS submissions_outlet_idx ON submissions (outlet_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status);
CREATE INDEX IF NOT EXISTS submissions_follow_up_idx ON submissions (follow_up_date);

CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  attempt_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS login_attempts_key_idx ON login_attempts (attempt_key, created_at);
`;
