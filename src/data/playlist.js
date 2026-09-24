// ============================================================================
//  MUSIC PLAYLIST  —  the songs for the player (20+ supported).
// ----------------------------------------------------------------------------
//  HOW TO USE YOUR OWN SONGS
//   1. Drop audio files into  public/music/  (mp3, m4a, wav, ogg all work).
//   2. Point each track's "src" at the file, e.g. src: "/music/my-song.mp3".
//   3. Edit "title" and "artist" to whatever you like. Add or remove tracks freely.
//
//  The files shipped now (track-01.wav … track-20.wav) are short, gentle
//  PLACEHOLDER tones — replace them with real songs whenever you're ready.
//
//  To turn music off entirely: set features.music.enabled = false in site.js
// ============================================================================

export const playlist = [
  { title: "Track One", artist: "Placeholder", src: "/music/track-01.wav" },
  { title: "Track Two", artist: "Placeholder", src: "/music/track-02.wav" },
  { title: "Track Three", artist: "Placeholder", src: "/music/track-03.wav" },
  { title: "Track Four", artist: "Placeholder", src: "/music/track-04.wav" },
  { title: "Track Five", artist: "Placeholder", src: "/music/track-05.wav" },
  { title: "Track Six", artist: "Placeholder", src: "/music/track-06.wav" },
  { title: "Track Seven", artist: "Placeholder", src: "/music/track-07.wav" },
  { title: "Track Eight", artist: "Placeholder", src: "/music/track-08.wav" },
  { title: "Track Nine", artist: "Placeholder", src: "/music/track-09.wav" },
  { title: "Track Ten", artist: "Placeholder", src: "/music/track-10.wav" },
  { title: "Track Eleven", artist: "Placeholder", src: "/music/track-11.wav" },
  { title: "Track Twelve", artist: "Placeholder", src: "/music/track-12.wav" },
  { title: "Track Thirteen", artist: "Placeholder", src: "/music/track-13.wav" },
  { title: "Track Fourteen", artist: "Placeholder", src: "/music/track-14.wav" },
  { title: "Track Fifteen", artist: "Placeholder", src: "/music/track-15.wav" },
  { title: "Track Sixteen", artist: "Placeholder", src: "/music/track-16.wav" },
  { title: "Track Seventeen", artist: "Placeholder", src: "/music/track-17.wav" },
  { title: "Track Eighteen", artist: "Placeholder", src: "/music/track-18.wav" },
  { title: "Track Nineteen", artist: "Placeholder", src: "/music/track-19.wav" },
  { title: "Track Twenty", artist: "Placeholder", src: "/music/track-20.wav" },
];

export default playlist;
