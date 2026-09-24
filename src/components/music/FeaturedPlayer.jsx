import { useRef, useState } from "react";
import { useMusic } from "./MusicProvider.jsx";
import { useEdit } from "../edit/EditContext.jsx";
import { resizeImage } from "../../lib/resizeImage.js";
import { putAudio, deleteAudio } from "../../lib/audioStore.js";
import PlayIcon from "./PlayIcon.jsx";
import "./music.css";

function fmt(t) {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// A compact, horizontal player that sits over the hero photo.
// The song-editing controls are hidden — tap the album art 4 times to reveal
// them (add songs, rename, change cover, remove).
export default function FeaturedPlayer() {
  const music = useMusic();
  const { content, setMusic, addTrack, updateTrack, removeTrack, editing, setEditing, setUnlocked } = useEdit();
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const taps = useRef([]);
  const barRef = useRef(null);
  const coverInput = useRef(null);
  const songInput = useRef(null);

  if (!music) return null;
  const { playlist, track, now, count, isPlaying, progress, current, duration, toggle, next, prev, select } = music;
  const cover = content.music.cover;
  const songEdit = editing; // song controls show while editing
  const showList = listOpen || songEdit;

  // Secret: 4 taps on the song track unlocks editing — reveals the Edit button
  // and turns on edit mode for the whole site (photos, sections, songs, footer).
  const onArtTap = () => {
    const t = Date.now();
    taps.current = [...taps.current, t].filter((x) => t - x < 2000);
    if (taps.current.length >= 4) {
      taps.current = [];
      setUnlocked(true);
      setEditing(true);
      setListOpen(true);
    }
  };

  const onScrub = (e) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    music.seek((e.clientX - rect.left) / rect.width);
  };

  const changeCover = async (fileList) => {
    const file = Array.from(fileList || []).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    const { src } = await resizeImage(file, { maxEdge: 500 });
    setMusic({ cover: { src } });
    if (coverInput.current) coverInput.current.value = "";
  };

  const addSongs = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("audio/"));
    if (!files.length) return;
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const id = `song-${Date.now()}-${i}`;
        await putAudio(id, f);
        addTrack({ id, kind: "file", title: f.name.replace(/\.[^.]+$/, ""), artist: "" });
      }
    } finally {
      setBusy(false);
      if (songInput.current) songInput.current.value = "";
    }
  };

  const deleteTrack = (t) => {
    if (t.kind === "file") deleteAudio(t.id);
    removeTrack(t.id);
  };

  return (
    <div className="fplayer">
      <div className="fplayer__row">
        {/* The album art + title form the secret "tap 4× to edit songs" area. */}
        <div className="fplayer__tap" onClick={onArtTap} title="Tap 4 times to edit songs">
          <span className={`fplayer__art ${isPlaying ? "is-spinning" : ""}`} aria-hidden="true">
            {cover?.src ? <img src={cover.src} alt="" /> : <span className="fplayer__art-dot" />}
          </span>

          <div className="fplayer__mid">
            <p className="fplayer__title">
              {now.title || "No songs yet"}
              {now.artist ? <span className="fplayer__artist"> · {now.artist}</span> : null}
            </p>
            <div className="fplayer__progress">
              <div
                className="fplayer__bar"
                ref={barRef}
                onClick={(e) => { e.stopPropagation(); onScrub(e); }}
                role="presentation"
              >
                <span className="fplayer__bar-fill" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="fplayer__t">{fmt(current)} / {fmt(duration)}</span>
            </div>
          </div>
        </div>

        <div className="fplayer__controls">
          <button type="button" className="fplayer__ctrl" onClick={prev} aria-label="Previous song">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M18 6v12M8 12l9-6v12z" fill="currentColor" /><rect x="6" y="6" width="2" height="12" rx="1" fill="currentColor" /></svg>
          </button>
          <button type="button" className="fplayer__toggle" onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"} aria-pressed={isPlaying}>
            <PlayIcon playing={isPlaying} size={22} />
          </button>
          <button type="button" className="fplayer__ctrl" onClick={next} aria-label="Next song">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6v12M16 12L7 6v12z" fill="currentColor" /><rect x="16" y="6" width="2" height="12" rx="1" fill="currentColor" /></svg>
          </button>
          <button type="button" className={`fplayer__ctrl ${showList ? "is-on" : ""}`} onClick={() => setListOpen((v) => !v)} aria-expanded={showList} aria-label="Show playlist">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 7h12M4 12h12M4 17h8M19 8v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" /><circle cx="17.5" cy="17" r="1.6" fill="currentColor" /></svg>
          </button>
        </div>
      </div>

      {songEdit ? (
        <div className="fplayer__editbar">
          <label className="fplayer__ebtn">
            <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => changeCover(e.target.files)} />
            Change cover
          </label>
          <label className={`fplayer__ebtn is-primary ${busy ? "is-busy" : ""}`}>
            <input ref={songInput} type="file" accept="audio/*" multiple hidden onChange={(e) => addSongs(e.target.files)} />
            {busy ? "Adding…" : "＋ Add songs"}
          </label>
          <button type="button" className="fplayer__ebtn" onClick={() => setEditing(false)}>Done</button>
        </div>
      ) : null}

      {showList ? (
        <ul className="fplaylist">
          {playlist.map((t, i) => (
            <li key={t.id}>
              {songEdit ? (
                <div className="fplaylist__edit">
                  <button type="button" className={`fplaylist__play ${i === track ? "is-current" : ""}`} onClick={() => select(i)} aria-label="Play this song">
                    <PlayIcon playing={i === track && isPlaying} size={14} />
                  </button>
                  <div className="fplaylist__fields">
                    <input className="fplaylist__field" value={t.title} placeholder="Song name" onChange={(e) => updateTrack(t.id, { title: e.target.value })} />
                    <input className="fplaylist__field fplaylist__field--sub" value={t.artist} placeholder="Artist (optional)" onChange={(e) => updateTrack(t.id, { artist: e.target.value })} />
                  </div>
                  <button type="button" className="fplaylist__del" onClick={() => deleteTrack(t)} aria-label="Remove song">×</button>
                </div>
              ) : (
                <button type="button" className={`fplaylist__item ${i === track ? "is-current" : ""}`} onClick={() => select(i)} aria-current={i === track ? "true" : undefined}>
                  <span className="fplaylist__index" aria-hidden="true">{i === track && isPlaying ? "▮▮" : String(i + 1).padStart(2, "0")}</span>
                  <span className="fplaylist__meta">
                    <span className="fplaylist__title">{t.title}</span>
                    {t.artist ? <span className="fplaylist__artist">{t.artist}</span> : null}
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
