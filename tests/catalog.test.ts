import assert from "node:assert/strict";
import test from "node:test";

import { isDirectMp3 } from "../src/lib/audio.ts";
import {
  CATALOG_SIZE,
  SATIRE_DISCLAIMER,
  featuredSong,
  releasedSongs,
  songs,
  videoSongs,
} from "../src/content/songs.ts";

test("catalog holds at least 21 songs with unique slugs", () => {
  assert.ok(songs.length >= CATALOG_SIZE);
  assert.equal(new Set(songs.map((song) => song.slug)).size, songs.length);
  for (const song of songs) {
    assert.match(song.slug, /^[a-z0-9-]+$/);
    assert.ok(song.title.length > 0);
    assert.ok(song.description.length > 0);
    assert.ok(song.genre.length > 0);
  }
});

test("Omar Is Going Away is the featured satire release", () => {
  const song = featuredSong();
  assert.equal(song.slug, "omar-is-going-away");
  assert.equal(song.youtubeId, "Oiug5ycMMEY");
  assert.equal(song.placeholder, false);
  assert.equal(song.genre, "Political satire / comedy music");
  assert.equal(song.satireDisclaimer, SATIRE_DISCLAIMER);
  assert.match(song.satireDisclaimer ?? "", /not a news report/i);
  assert.equal(songs.filter((item) => item.featured).length, 1);
});

test("placeholders are labeled and have no invented media", () => {
  const placeholders = songs.filter((song) => song.placeholder);
  assert.ok(placeholders.length >= 20);
  for (const song of placeholders) {
    assert.match(song.title, /Placeholder/);
    assert.equal(song.mp3Url, undefined);
    assert.equal(song.youtubeId, undefined);
    assert.equal(song.artwork, undefined);
  }
});

test("direct MP3 links are https files and YouTube pages are rejected", () => {
  assert.equal(isDirectMp3("https://example.com/audio/omar.mp3"), true);
  assert.equal(isDirectMp3("https://thefump.com/files/song.mp3"), true);
  assert.equal(isDirectMp3("http://example.com/song.mp3"), false);
  assert.equal(isDirectMp3("https://youtu.be/Oiug5ycMMEY"), false);
  assert.equal(isDirectMp3("https://www.youtube.com/watch?v=Oiug5ycMMEY"), false);
  assert.equal(isDirectMp3("https://example.com/song.mp3.page"), false);
  assert.equal(isDirectMp3(undefined), false);
  for (const song of songs) {
    if (song.mp3Url) assert.equal(isDirectMp3(song.mp3Url), true);
  }
});

test("videos come only from songs that have a YouTube id", () => {
  assert.deepEqual(videoSongs().map((song) => song.slug), ["omar-is-going-away"]);
  assert.equal(releasedSongs().length, 1);
});
