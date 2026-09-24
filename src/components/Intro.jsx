import { useEffect, useState } from "react";
import { useEdit } from "./edit/EditContext.jsx";
import "./Intro.css";

const KEY = "photo-gallery/intro-seen";

// A soft opening screen that gently gives way to the site — makes it feel like
// a little surprise rather than just a page. Shows once per visit (per tab).
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

  return (
    <div className={`intro ${leaving ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="intro__glow" aria-hidden="true" />
      <div className="intro__inner">
        <p className="intro__eyebrow">a little place for us</p>
        <h1 className="intro__title">{content.hero.title}</h1>
        <button type="button" className="intro__open" onClick={close} autoFocus>
          Open
        </button>
      </div>
    </div>
  );
}
