import { useRef, useState } from "react";
import { site } from "../data/site.js";
import { toneGradient } from "../lib/gradient.js";
import { resizeImage } from "../lib/resizeImage.js";
import { useEdit } from "./edit/EditContext.jsx";
import EditableText from "./edit/EditableText.jsx";
import FeaturedPlayer from "./music/FeaturedPlayer.jsx";
import "./Hero.css";

// The opening section: the owner's featured photo with a minimal introduction
// and the music player sitting right over the home photo.
export default function Hero() {
  const { content, setHero, setIntro, editing } = useEdit();
  const { scrollHint } = site.hero;
  const hero = content.hero;
  const photo = hero.photo || {};
  const hasImage = Boolean(photo.src);

  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const changePhoto = async (fileList) => {
    const file = Array.from(fileList || []).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    setBusy(true);
    try {
      const { src } = await resizeImage(file, { maxEdge: 2000 });
      setHero({ photo: { src, alt: hero.photo?.alt || "A favorite memory" } });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <header className="hero">
      <div
        className="hero__media"
        style={hasImage ? undefined : { background: toneGradient(["#c9b3e0", "#7c53b8"]) }}
      >
        {hasImage ? (
          <img
            className="hero__img"
            src={photo.src}
            alt={photo.alt || ""}
            fetchpriority="high"
            decoding="async"
            draggable="false"
          />
        ) : null}
        <div className="hero__scrim" aria-hidden="true" />
      </div>

      {editing ? (
        <div className="hero__edit-actions">
          <label className={`change-photo ${busy ? "is-busy" : ""}`}>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => changePhoto(e.target.files)} />
            {busy ? "Uploading…" : "Change hero photo"}
          </label>
        </div>
      ) : null}

      {editing ? (
        <div className="hero__intro-edit">
          <p className="hero__intro-edit-title">Opening screen</p>
          <label className="hero__intro-field">
            <span>Small line</span>
            <input
              type="text"
              value={content.intro.eyebrow || ""}
              placeholder="a little place for us"
              onChange={(e) => setIntro({ eyebrow: e.target.value })}
            />
          </label>
          <label className="hero__intro-field">
            <span>Button text</span>
            <input
              type="text"
              value={content.intro.button || ""}
              placeholder="Open"
              onChange={(e) => setIntro({ button: e.target.value })}
            />
          </label>
          <p className="hero__intro-note">The big word uses your title above.</p>
        </div>
      ) : null}

      <div className="hero__content container">
        {(content.hero.eyebrow || editing) && (
          <p className="eyebrow hero__eyebrow hero__enter" style={{ "--d": "0.05s" }}>
            <EditableText
              editing={editing}
              value={content.hero.eyebrow}
              onChange={(v) => setHero({ eyebrow: v })}
              placeholder="a small line"
              ariaLabel="Hero eyebrow"
            />
          </p>
        )}

        <h1 className="hero__title hero__enter" style={{ "--d": "0.15s" }}>
          <EditableText
            editing={editing}
            value={hero.title}
            onChange={(v) => setHero({ title: v })}
            placeholder="Title"
            ariaLabel="Home title"
          />
        </h1>

        {(hero.tagline || editing) && (
          <p className="hero__tagline hero__enter" style={{ "--d": "0.3s" }}>
            <EditableText
              editing={editing}
              value={hero.tagline}
              onChange={(v) => setHero({ tagline: v })}
              placeholder="A short line"
              ariaLabel="Home tagline"
            />
          </p>
        )}
      </div>

      {site.features?.music?.enabled ? (
        <div className="hero__player container hero__enter" style={{ "--d": "0.45s" }}>
          <FeaturedPlayer />
        </div>
      ) : null}

      {scrollHint && !editing ? (
        <div className="hero__scroll hero__enter" style={{ "--d": "0.6s" }} aria-hidden="true">
          <span>{scrollHint}</span>
          <span className="hero__scroll-line" />
        </div>
      ) : null}
    </header>
  );
}
