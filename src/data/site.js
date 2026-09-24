// ============================================================================
//  SITE SETTINGS & FEATURE TOGGLES
//  (The hero photo/title/tagline, closing message, and all trips/occasions are
//   edited on-screen with the "Edit" button — those live in the content store.
//   This file only holds a couple of small labels and the feature switches.)
// ============================================================================

export const site = {
  hero: {
    // Small line above the title (kept subtle). Set to "" to hide it.
    eyebrow: "welcome",
    // Tiny scroll hint. Empty by default so it never crowds the player.
    scrollHint: "",
  },

  // ---- Feature switches: flip any to false to remove that feature ----------
  features: {
    // Background music player (a full playlist). Never autoplays.
    // The songs live in src/data/playlist.js.
    music: {
      enabled: true,
    },

    // Visual memory timeline (auto-built from your "trip" sections).
    timeline: true,

    // The on-screen Edit button (add/adjust photos, captions, sections).
    edit: true,
  },
};

export default site;
