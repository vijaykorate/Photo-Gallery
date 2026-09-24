import { useEffect, useState } from "react";
import { useEdit } from "./edit/EditContext.jsx";
import "./Intro.css";

const KEY = "photo-gallery/intro-seen";

// A soft opening screen that gently gives way to the site — makes it feel like
// a little surprise rather than just a page. Shows once per visit (per tab).
// Its text is edited from the hero's "Opening screen" panel in Edit mode.
export default function Intro() {
  const { content, editing } = useEdit();
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem(KEY);
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);

  const close = () => {
    setLeaving(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setTimeout(() => setOpen(false), 750);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Never block the owner while they're editing.
  if (!open || editing) return null;

  const intro = content.intro;

  return (
    <div className={`intro ${leaving ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="intro__glow" aria-hidden="true" />
      <div className="intro__inner">
        {intro.eyebrow ? <p className="intro__eyebrow">{intro.eyebrow}</p> : null}
        <h1 className="intro__title">{content.hero.title}</h1>
        <button type="button" className="intro__open" onClick={close} autoFocus>
          {intro.button || "Open"}
        </button>
      </div>
    </div>
  );
}
