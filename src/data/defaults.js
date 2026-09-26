// ============================================================================
//  DEFAULT CONTENT  —  the real gallery, baked into the site.
//  (Generated from a saved backup. Everyone who opens the site sees this;
//   "Reset" in Edit mode restores back to it. Edit on-screen to change things.)
// ============================================================================

export const defaultContent = {
  intro: { eyebrow: "a little place for us", button: "Open" },
  hero: {
    eyebrow: "welcome",
    title: "Our Memories",
    tagline: "A little place for our memories.",
    photo: { src: "/images/mem-hero.jpg", alt: "A favorite memory" },
  },
  closing: {
    message: "Here's to all of it — and everything still ahead.",
    signature: "— for you",
    photo: { src: "/images/photo-closing.jpg", alt: "One more to remember" },
  },
  // Songs are baked into the site so they play on EVERY device (no sign-in).
  //  1. Drop your .mp3 files into  public/music/
  //  2. Add one entry per song below (kind MUST be "url").
  // Example:
  //   { id: "song-1", kind: "url", src: "/music/our-song.mp3", title: "Our Song", artist: "Artist" },
  // `cover` is an optional static album image, e.g. { src: "/images/mem-hero.jpg" } (or null).
  music: {
    cover: null,
    tracks: [
      { id: "song-1", kind: "url", src: "/music/track-01.mp3", title: "Track 1", artist: "" },
      { id: "song-2", kind: "url", src: "/music/track-02.mp3", title: "Track 2", artist: "" },
      { id: "song-3", kind: "url", src: "/music/track-03.mp3", title: "Track 3", artist: "" },
      { id: "song-4", kind: "url", src: "/music/track-04.mp3", title: "Track 4", artist: "" },
      { id: "song-5", kind: "url", src: "/music/track-05.mp3", title: "Track 5", artist: "" },
      { id: "song-6", kind: "url", src: "/music/track-06.mp3", title: "Track 6", artist: "" },
      { id: "song-7", kind: "url", src: "/music/track-07.mp3", title: "Track 7", artist: "" },
      { id: "song-8", kind: "url", src: "/music/track-08.mp3", title: "Track 8", artist: "" },
      { id: "song-9", kind: "url", src: "/music/track-09.mp3", title: "Track 9", artist: "" },
      { id: "song-10", kind: "url", src: "/music/track-10.mp3", title: "Track 10", artist: "" },
      { id: "song-11", kind: "url", src: "/music/track-11.mp3", title: "Track 11", artist: "" },
      { id: "song-12", kind: "url", src: "/music/track-12.mp3", title: "Track 12", artist: "" },
      { id: "song-13", kind: "url", src: "/music/track-13.mp3", title: "Track 13", artist: "" },
      { id: "song-14", kind: "url", src: "/music/track-14.mp3", title: "Track 14", artist: "" },
      { id: "song-15", kind: "url", src: "/music/track-15.mp3", title: "Track 15", artist: "" },
      { id: "song-16", kind: "url", src: "/music/track-16.mp3", title: "Track 16", artist: "" },
      { id: "song-17", kind: "url", src: "/music/track-17.mp3", title: "Track 17", artist: "" },
      { id: "song-18", kind: "url", src: "/music/track-18.mp3", title: "Track 18", artist: "" },
      { id: "song-19", kind: "url", src: "/music/track-19.mp3", title: "Track 19", artist: "" },
    ],
  },
  groups: [
  {
    id: "g-first-trip",
    kind: "trip",
    title: "The First Trip",
    note: "where it all started",
    photos: [
      { id: "mem-1-1", src: "/images/mem-1-1.jpg", alt: "On the way", ratio: "720/1280", caption: "" },
      { id: "mem-1-2", src: "/images/mem-1-2.jpg", alt: "A quiet afternoon", ratio: "720/1280", caption: "" },
      { id: "mem-1-3", src: "/images/mem-1-3.jpg", alt: "Golden hour", ratio: "900/1600", caption: "" },
      { id: "mem-1-4", src: "/images/mem-1-4.jpg", alt: "Somewhere new", ratio: "900/1600", caption: "" },
    ],
  },
  {
    id: "g-birthday",
    kind: "occasion",
    title: "Obsessed ",
    note: "Love",
    photos: [
      { id: "mem-2-1", src: "/images/mem-2-1.jpg", alt: "Little things", ratio: "1203/1600", caption: "" },
      { id: "mem-2-2", src: "/images/mem-2-2.jpg", alt: "A found detail", ratio: "875/1600", caption: "" },
      { id: "mem-2-3", src: "/images/mem-2-3.jpg", alt: "A little light", ratio: "865/1071", caption: "" },
      { id: "mem-2-4", src: "/images/mem-2-4.jpg", alt: "1000789744", ratio: "900/1600", caption: "" },
    ],
  },
  {
    id: "g-by-the-sea",
    kind: "trip",
    title: "By the Sea",
    note: "salt, sun, slow days",
    photos: [
      { id: "mem-3-1", src: "/images/mem-3-1.jpg", alt: "The one we love", ratio: "960/1280", caption: "" },
      { id: "mem-3-2", src: "/images/mem-3-2.jpg", alt: "Come back to this", ratio: "900/1600", caption: "" },
      { id: "mem-3-3", src: "/images/mem-3-3.jpg", alt: "The good kind of tired", ratio: "720/1280", caption: "" },
      { id: "mem-3-4", src: "/images/mem-3-4.jpg", alt: "Toward the water", ratio: "1200/1600", caption: "" },
    ],
  },
  {
    id: "g-festival",
    kind: "occasion",
    title: "Festival Night",
    note: "lights everywhere",
    photos: [
      { id: "mem-4-1", src: "/images/mem-4-1.jpg", alt: "That whole day", ratio: "1204/1600", caption: "" },
      { id: "mem-4-2", src: "/images/mem-4-2.jpg", alt: "Worth remembering", ratio: "1204/1600", caption: "" },
      { id: "mem-4-3", src: "/images/mem-4-3.jpg", alt: "Let's do it again", ratio: "899/1599", caption: "" },
    ],
  },
  ],
};

export default defaultContent;
