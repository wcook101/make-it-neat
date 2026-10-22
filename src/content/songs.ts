export const CATALOG_SIZE = 21;

export const SATIRE_DISCLAIMER =
  "Satire and comedy. This song is a fictional performance. It uses exaggeration for humor and is not a news report. Nothing on this page is a factual allegation about any person or event.";

export type StreamingLink = {
  label: string;
  href: string;
};

export type Song = {
  slug: string;
  title: string;
  description: string;
  genre: string;
  featured?: boolean;
  /** True when the title, audio, or artwork has not been supplied yet. */
  placeholder: boolean;
  youtubeId?: string;
  /** Site path or HTTPS URL for an .mp3 file. Leave unset until the file exists. */
  mp3Url?: string;
  /** Public image URL or a file in /public. Leave unset until artwork exists. */
  artwork?: string;
  artworkNote?: string;
  streaming?: StreamingLink[];
  satireDisclaimer?: string;
  lyrics?: string;
  duration?: string;
  releaseDate?: string;
};

/**
 * Add a finished song by appending one object to this array.
 * To attach an MP3, set mp3Url to a file in public, such as /audio/song.mp3,
 * or to a public HTTPS link that ends in .mp3.
 * To attach cover art, set artwork to an https image or a path such as /covers/song.jpg
 * and put the file in public/covers. Do not point mp3Url at a YouTube page.
 * Placeholder slots fill the catalog up to 21 entries and are labeled as placeholders.
 */
export const releases: Song[] = [
  {
    slug: "omar-is-going-away",
    title: "Omar Is Going Away",
    genre: "Political satire / comedy music",
    featured: true,
    placeholder: false,
    description:
      "A political satire and comedy song by Make It Neat. The recording is a performed joke, not a documentary.",
    youtubeId: "Oiug5ycMMEY",
    mp3Url: "/audio/omar-is-going-away.mp3",
    artwork: "https://i.ytimg.com/vi/Oiug5ycMMEY/hqdefault.jpg",
    artworkNote: "Temporary artwork: YouTube video thumbnail. Replace with final cover art when the image file is ready.",
    streaming: [
      { label: "YouTube", href: "https://youtu.be/Oiug5ycMMEY" },
    ],
    satireDisclaimer: SATIRE_DISCLAIMER,
  },
];

function placeholderSlot(number: number): Song {
  const label = String(number).padStart(2, "0");
  return {
    slug: `placeholder-${label}`,
    title: `Placeholder slot ${label}`,
    genre: "Not assigned",
    placeholder: true,
    description:
      "This catalog slot is empty. Replace it in src/content/songs.ts when the song title, description, artwork, and MP3 are ready.",
  };
}

export function withPlaceholders(released: Song[]): Song[] {
  const fillers: Song[] = [];
  const used = new Set(released.map((song) => song.slug));
  let number = released.length + 1;
  while (released.length + fillers.length < CATALOG_SIZE && number < 100) {
    const slug = `placeholder-${String(number).padStart(2, "0")}`;
    const slotNumber = number;
    number += 1;
    if (used.has(slug)) continue;
    fillers.push(placeholderSlot(slotNumber));
    used.add(slug);
  }
  return [...released, ...fillers];
}

export const songs: Song[] = withPlaceholders(releases);

export function featuredSong(): Song {
  return songs.find((song) => song.featured) ?? songs[0];
}

export function songBySlug(slug: string): Song | undefined {
  return songs.find((song) => song.slug === slug);
}

export function releasedSongs(): Song[] {
  return songs.filter((song) => !song.placeholder);
}

export function videoSongs(): Song[] {
  return songs.filter((song) => Boolean(song.youtubeId));
}
