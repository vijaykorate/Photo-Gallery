import { useCallback, useEffect, useRef, useState } from "react";
import { toneGradient } from "../lib/gradient.js";
import "./Lightbox.css";

// Fullscreen photo viewer.
//  • Prev / Next / Close buttons (large, touch-friendly)
//  • Keyboard: ← → navigate, Esc closes
//  • Swipe left/right on touch screens
//  • Click the backdrop to close; focus is trapped while open; body scroll locked
export default function Lightbox({ photos, index, onClose, onChange }) {
  const open = index !== null && index >= 0;
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const touchStart = useRef(null);
  const [anim, setAnim] = useState(""); // "next" | "prev" for the slide direction

  const count = photos.length;
  const photo = open ? photos[index] : null;

  const goNext = useCallback(() => {
    if (count < 2) return;
    setAnim("next");
    onChange((index + 1) % count);
  }, [count, index, onChange]);

  const goPrev = useCallback(() => {
    if (count < 2) return;
    setAnim("prev");
    onChange((index - 1 + count) % count);
  }, [count, index, onChange]);

  // Keyboard navigation + focus trap.
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Tab") {
        // Simple focus trap across the interactive controls.
        const focusables = dialogRef.current?.querySelectorAll("button");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goNext, goPrev, onClose]);

  // Lock background scroll while open and move focus into the dialog.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the close button so keyboard/screen-reader users start inside.
    const t = setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  if (!open || !photo) return null;

  const hasImage = Boolean(photo.src);

  // Touch swipe handling.
  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    // Horizontal, deliberate swipe only.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt || "Photo"}
      ref={dialogRef}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        ref={closeRef}
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {count > 1 ? (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      ) : null}

      <figure
        className={`lightbox__stage ${anim ? `is-${anim}` : ""}`}
        key={photo.id}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasImage ? (
          <img
            className="lightbox__img"
            src={photo.src}
            alt={photo.alt || ""}
            decoding="async"
            draggable="false"
          />
        ) : (
          <span
            className="lightbox__placeholder"
            style={{ background: toneGradient(photo.tone), aspectRatio: photo.ratio || "3/4" }}
            aria-hidden="true"
          />
        )}
        {(photo.caption || photo.alt) && (
          <figcaption className="lightbox__caption">
            <span className="lightbox__alt">{photo.caption || photo.alt}</span>
          </figcaption>
        )}
      </figure>

      {count > 1 ? (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      ) : null}

      {count > 1 ? (
        <div className="lightbox__counter" aria-hidden="true">
          {index + 1} / {count}
        </div>
      ) : null}
    </div>
  );
}
