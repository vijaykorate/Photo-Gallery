// ============================================================================
//  DEFAULT CONTENT  —  what a first-time visitor sees before you edit anything.
// ----------------------------------------------------------------------------
//  You normally DON'T need to touch this: use the on-screen "Edit" button to
//  add your own trips/occasions, photos, captions, and the hero photo. Your
//  changes are saved in your browser and override everything here.
//
//  (This file is only the starting point / "Reset" restores it.)
// ============================================================================

import { playlist } from "./playlist.js";

// Small helper to keep the photo objects tidy.
const p = (src, alt, ratio = "3/4", caption = "") => ({
  id: src,
  src,
  alt,
  ratio,
  caption,
});

// The starting songs (built-in placeholder tones). Users can add their own.
const defaultTracks = playlist.map((t, i) => ({
  id: `builtin-${i + 1}`,
  title: t.title,
  artist: t.artist,
  kind: "builtin",
  src: t.src,
}));

export const defaultContent = {
  // The opening "Open" screen.
  intro: {
    eyebrow: "a little place for us",
    button: "Open",
  },
  hero: {
    eyebrow: "welcome",
    title: "Our Memories",
    tagline: "A little place for our memories.",
    photo: { src: "/images/photo-hero.jpg", alt: "A favorite memory" },
  },
  // The music player: a cover image (tap to change) + the song list.
  music: { cover: null, tracks: defaultTracks },
  closing: {
    message: "Here's to all of it — and everything still ahead.",
    signature: "— for you",
    photo: { src: "/images/photo-closing.jpg", alt: "One more to remember" },
  },
  groups: [
    {
      id: "g-first-trip",
      kind: "trip",
      title: "The First Trip",
      note: "where it all started",
      photos: [
        p("/images/trip-1.jpg", "On the way", "4/3"),
        p("/images/photo-m1.jpg", "A quiet afternoon", "3/4"),
        p("/images/photo-m3.jpg", "Golden hour", "1/1"),
        p("/images/photo-m4.jpg", "Somewhere new", "3/4"),
      ],
    },
    {
      id: "g-birthday",
      kind: "occasion",
      title: "Birthday",
      note: "cake, candles, chaos",
      photos: [
        p("/images/photo-l1.jpg", "Little things", "1/1"),
        p("/images/photo-l2.jpg", "A found detail", "3/4"),
        p("/images/photo-l6.jpg", "A little light", "4/5"),
      ],
    },
    {
      id: "g-by-the-sea",
      kind: "trip",
      title: "By the Sea",
      note: "salt, sun, slow days",
      photos: [
        p("/images/trip-3.jpg", "Toward the water", "4/3"),
        p("/images/photo-f1.jpg", "The one we love", "4/3"),
        p("/images/photo-f2.jpg", "Come back to this", "3/4"),
        p("/images/photo-b3.jpg", "The good kind of tired", "1/1"),
      ],
    },
    {
      id: "g-festival",
      kind: "occasion",
      title: "Festival Night",
      note: "lights everywhere",
      photos: [
        p("/images/photo-b1.jpg", "That whole day", "16/10"),
        p("/images/photo-b4.jpg", "Worth remembering", "4/3"),
        p("/images/photo-b5.jpg", "Let's do it again", "3/4"),
      ],
    },
  ],
};

export default defaultContent;
