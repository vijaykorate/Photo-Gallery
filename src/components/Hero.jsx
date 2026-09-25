import { useEffect, useRef, useState } from "react";
import { site } from "../data/site.js";
import { toneGradient } from "../lib/gradient.js";
import { resizeToBlob } from "../lib/resizeImage.js";
import { storeImage } from "../lib/storeImage.js";
import ResolvedImg from "./ResolvedImg.jsx";
import { useEdit } from "./edit/EditContext.jsx";
import EditableText from "./edit/EditableText.jsx";
import FeaturedPlayer from "./music/FeaturedPlayer.jsx";
import "./Hero.css";

// The opening section: the owner's featured photo with a minimal introduction
// and the music player sitting right over the home photo.
export default function Hero() {
  const { content, setHero, setIntro, editing, token } = useEdit();
  const { scrollHint } = site.hero;
  const hero = content.hero;
  const photo = hero.photo || {};
  const hasImage = Boolean(photo.src);

  const inputRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Gentle scroll parallax: the photo drifts slower than the page and the intro
  // text eases away as the gallery arrives. Disabled under reduced-motion.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        mediaRef.current?.style.setProperty("--parallax", `${Math.min(y * 0.35, 320)}px`);
        if (contentRef.current) {
          contentRef.current.style.opacity = String(Math.max(0, 1 - y / 480));
          contentRef.current.style.transform = `translateY(${Math.min(y * 0.18, 120)}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const changePhoto = async (fileList) => {
    const file = Array.from(fileList || []).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    setBusy(true);
    try {
      const { blob } = await resizeToBlob(file, { maxEdge: 2000 });
      const src = blob ? await storeImage(blob, token) : null;
      setHero({ photo: { src, alt: hero.photo?.alt || "A favorite memory" } });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <header className="hero">
      <div
        ref={mediaRef}
        className="hero__media"
        style={hasImage ? undefined : { background: toneGradient(["#c9b3e0", "#7c53b8"]) }}
      >
        {hasImage ? (
          <ResolvedImg
            className="hero__img"
            src={photo.src}
            alt={photo.alt || ""}
            decoding="async"
            loading="eager"
            fetchpriority="high"
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

      <div className="hero__content container" ref={contentRef}>
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
