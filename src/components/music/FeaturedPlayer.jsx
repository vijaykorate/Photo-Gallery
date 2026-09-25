import { useRef, useState } from "react";
import { useMusic } from "./MusicProvider.jsx";
import { useEdit } from "../edit/EditContext.jsx";
import ResolvedImg from "../ResolvedImg.jsx";
import PlayIcon from "./PlayIcon.jsx";
import "./music.css";

function fmt(t) {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// A compact, horizontal player that sits over the hero photo.
// Songs are baked into the site (static files) and are the same on every device;
// they are not editable from the web. Tapping the album art 4 times still
// unlocks EDIT MODE (for photos/text) — that gesture is the only way in.
export default function FeaturedPlayer() {
  const music = useMusic();
  const { content, setEditing, setUnlocked, token } = useEdit();
  const [listOpen, setListOpen] = useState(false);
  const taps = useRef([]);
  const barRef = useRef(null);

  if (!music) return null;
  const { playlist, track, now, isPlaying, progress, current, duration, toggle, next, prev, select } = music;
  const cover = content.music.cover;

  // Secret: 4 taps on the album art unlocks editing. If already signed in this
  // session, go straight to editing; otherwise the password gate appears.
  const onArtTap = () => {
    const t = Date.now();
    taps.current = [...taps.current, t].filter((x) => t - x < 2000);
    if (taps.current.length >= 4) {
      taps.current = [];
      setUnlocked(true);
      if (token) setEditing(true);
    }
  };

  const onScrub = (e) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    music.seek((e.clientX - rect.left) / rect.width);
  };

  return (
    <div className="fplayer">
      <div className="fplayer__row">
        {/* The album art + title form the secret "tap 4× to edit" area. */}
        <div className="fplayer__tap" onClick={onArtTap} title="Tap 4 times to edit">
          <span className={`fplayer__art ${isPlaying ? "is-spinning" : ""}`} aria-hidden="true">
            {cover?.src ? <ResolvedImg src={cover.src} alt="" /> : <span className="fplayer__art-dot" />}
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
          <button type="button" className={`fplayer__ctrl ${listOpen ? "is-on" : ""}`} onClick={() => setListOpen((v) => !v)} aria-expanded={listOpen} aria-label="Show playlist">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 7h12M4 12h12M4 17h8M19 8v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" /><circle cx="17.5" cy="17" r="1.6" fill="currentColor" /></svg>
          </button>
        </div>
      </div>

      {listOpen ? (
        <ul className="fplaylist">
          {playlist.map((t, i) => (
            <li key={t.id}>
              <button type="button" className={`fplaylist__item ${i === track ? "is-current" : ""}`} onClick={() => select(i)} aria-current={i === track ? "true" : undefined}>
                <span className="fplaylist__index" aria-hidden="true">{i === track && isPlaying ? "▮▮" : String(i + 1).padStart(2, "0")}</span>
                <span className="fplaylist__meta">
                  <span className="fplaylist__title">{t.title}</span>
                  {t.artist ? <span className="fplaylist__artist">{t.artist}</span> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
