import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useEdit } from "../edit/EditContext.jsx";
import { getAudio } from "../../lib/audioStore.js";

// One shared <audio> element drives the featured player card, the floating
// button, the track list, and the hero play control — so play/pause and the
// current song always stay in sync. Full playlist (next / previous /
// auto-advance), never autoplaying on page load.
//
// Songs come from the editable content (content.music.tracks). Built-in tracks
// play from a file URL; user-added tracks resolve their audio blob from
// IndexedDB into a temporary object URL.
const MusicContext = createContext(null);

export function useMusic() {
  return useContext(MusicContext);
}

export function MusicProvider({ children }) {
  const { content } = useEdit();
  const tracks = content.music.tracks;
  const count = tracks.length;

  const audioRef = useRef(null);
  const objectUrlRef = useRef(null); // current blob: URL, so we can revoke it

  const [track, setTrack] = useState(0);
  const [resolvedUrl, setResolvedUrl] = useState(null);
  const [isPlaying, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const wantPlay = useRef(false);

  const now = tracks[track] || {};

  // Keep the index valid if songs are added/removed.
  useEffect(() => {
    if (track >= count && count > 0) setTrack(0);
  }, [count, track]);

  // Wire the audio element's events once.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrent(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => { wantPlay.current = true; setTrack((t) => (t + 1) % count); };
    const onErr = () => { setUnavailable(true); setPlaying(false); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onErr);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onErr);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [count]);

  // Resolve the current track's playable URL (built-in file, or IndexedDB blob).
  useEffect(() => {
    let cancelled = false;
    setUnavailable(false);
    setProgress(0);
    setCurrent(0);

    const revokePrev = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    const t = tracks[track];
    if (!t) { revokePrev(); setResolvedUrl(null); return; }

    if (t.kind === "file") {
      getAudio(t.id)
        .then((blob) => {
          if (cancelled) return;
          revokePrev();
          if (blob) {
            const url = URL.createObjectURL(blob);
            objectUrlRef.current = url;
            setResolvedUrl(url);
          } else {
            setUnavailable(true);
            setResolvedUrl(null);
          }
        })
        .catch(() => { if (!cancelled) { setUnavailable(true); setResolvedUrl(null); } });
    } else {
      revokePrev();
      setResolvedUrl(t.src || null);
    }

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, now.id, now.src]);

  // When the resolved URL changes, (re)load and play if the user asked to.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !resolvedUrl) return;
    audio.load();
    if (wantPlay.current) {
      audio.play().then(() => setPlaying(true)).catch(() => { setUnavailable(true); setPlaying(false); });
    }
  }, [resolvedUrl]);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    wantPlay.current = true;
    if (!resolvedUrl) return; // nothing to play yet
    audio.play().then(() => setPlaying(true)).catch(() => { setUnavailable(true); setPlaying(false); });
  };
  const pause = () => { wantPlay.current = false; audioRef.current?.pause(); setPlaying(false); };
  const toggle = () => (isPlaying ? pause() : play());

  const select = (i) => {
    wantPlay.current = true;
    if (i === track) toggle();
    else setTrack(((i % count) + count) % count);
  };
  const next = () => { wantPlay.current = isPlaying || wantPlay.current; setTrack((t) => (t + 1) % count); };
  const prev = () => { wantPlay.current = isPlaying || wantPlay.current; setTrack((t) => (t - 1 + count) % count); };

  const seek = (fraction) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(Math.max(fraction, 0), 1) * audio.duration;
  };

  const value = useMemo(
    () => ({ playlist: tracks, track, now, count, isPlaying, progress, duration, current, unavailable, toggle, play, pause, next, prev, select, seek }),
    [tracks, track, now, count, isPlaying, progress, duration, current, unavailable]
  );

  return (
    <MusicContext.Provider value={value}>
      {/* preload="none": nothing is fetched until the visitor presses play. */}
      <audio ref={audioRef} src={resolvedUrl || undefined} preload="none" />
      {children}
    </MusicContext.Provider>
  );
}

export default MusicProvider;
