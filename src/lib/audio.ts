const BLOCKED_HOSTS = ["youtube.com", "youtu.be", "music.youtube.com", "youtube-nocookie.com"];

/** A FuMP-ready link is a public HTTPS URL whose path ends in .mp3. YouTube pages are not audio files. */
export function isDirectMp3(value: string | undefined | null): value is string {
  if (!value) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) {
    return false;
  }
  return url.pathname.toLowerCase().endsWith(".mp3");
}
