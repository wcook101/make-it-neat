const BLOCKED_HOSTS = ["youtube.com", "youtu.be", "music.youtube.com", "youtube-nocookie.com"];

function endsWithMp3(pathname: string): boolean {
  return pathname.split("?")[0].split("#")[0].toLowerCase().endsWith(".mp3");
}

/**
 * A playable file is either a site path such as /audio/song.mp3
 * or a public HTTPS URL whose path ends in .mp3. YouTube pages are not audio files.
 */
export function isDirectMp3(value: string | undefined | null): value is string {
  if (!value || value.includes("..")) return false;
  if (value.startsWith("/") && !value.startsWith("//")) {
    return endsWithMp3(value);
  }
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
  return endsWithMp3(url.pathname);
}
