import { useCallback, useEffect, useRef, useState } from "react";
import { toneGradient } from "../lib/gradient.js";
import { imageUrl } from "../lib/server.js";
import ResolvedImg from "./ResolvedImg.jsx";
import "./Lightbox.css";

// Fullscreen photo viewer.
//  • Prev / Next / Close buttons (large, touch-friendly)
//  • Keyboard: ← → navigate, Esc closes, +/- zoom
//  • Zoom: double-click / double-tap toggles 1×↔zoom; wheel + pinch zoom; drag to pan
//  • Swipe left/right to navigate; drag down to dismiss (when not zoomed)
//  • Neighbor images are preloaded so navigation is instant
//  • Backdrop click to close; focus trapped; body scroll locked; changes announced
const MAX_ZOOM = 3.5;

// A directly-loadable URL for prefetching neighbors (idb: blobs are local/fast).
function preloadUrl(src) {
  if (typeof src !== "string") return null;
  if (src.startsWith("srv:")) return imageUrl(src.slice(4));
  if (src.startsWith("idb:")) return null;
  return src;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export default function Lightbox({ photos, index, onClose, onChange }) {
  const open = index !== null && index >= 0;
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [anim, setAnim] = useState(""); // "next" | "prev" for the slide direction
  const [slideshow, setSlideshow] = useState(false);

  // Zoom / pan / drag-to-dismiss state.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(0); // vertical dismiss offset (px)
  const pointers = useRef(new Map());
  const gesture = useRef(null); // { mode, ... }
  const lastTap = useRef(0);

  const count = photos.length;
  const photo = open ? photos[index] : null;
  const zoomed = zoom > 1.01;

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDrag(0);
  }, []);

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

  // Reset zoom/pan whenever the photo (or open state) changes.
  useEffect(() => {
    resetView();
  }, [index, open, resetView]);

  // Prefetch the neighbours so left/right is instant.
  useEffect(() => {
    if (!open || count < 2) return;
    [index + 1, index - 1].forEach((i) => {
      const p = photos[((i % count) + count) % count];
      const u = p && preloadUrl(p.src);
      if (u) {
        const im = new Image();
        im.decoding = "async";
        im.src = u;
      }
    });
  }, [open, index, count, photos]);

  // Slideshow: auto-advance while playing (not under reduced-motion). Stops when closed.
  useEffect(() => {
    if (!open || !slideshow || count < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(goNext, 3800);
    return () => clearInterval(id);
  }, [open, slideshow, count, goNext]);

  useEffect(() => {
    if (!open) setSlideshow(false);
  }, [open]);

  // Keyboard navigation + focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        zoomed ? resetView() : onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => clamp(z + 0.5, 1, MAX_ZOOM));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((z) => {
          const nz = clamp(z - 0.5, 1, MAX_ZOOM);
          if (nz <= 1.01) setPan({ x: 0, y: 0 });
          return nz;
        });
      } else if (e.key === "Tab") {
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
  }, [open, goNext, goPrev, onClose, zoomed, resetView]);

  // Lock background scroll while open and move focus into the dialog.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  if (!open || !photo) return null;

  const hasImage = Boolean(photo.src);

  // ---- Pointer gestures (mouse + touch, unified) ----
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const pts = () => [...pointers.current.values()];

  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = pts();
    if (p.length === 2) {
      gesture.current = { mode: "pinch", startDist: dist(p[0], p[1]), startZoom: zoom };
    } else if (p.length === 1) {
      gesture.current = {
        mode: zoomed ? "pan" : "decide",
        startX: e.clientX,
        startY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const p = pts();

    if (g.mode === "pinch" && p.length >= 2) {
      const nz = clamp((g.startZoom * dist(p[0], p[1])) / (g.startDist || 1), 1, MAX_ZOOM);
      setZoom(nz);
      if (nz <= 1.01) setPan({ x: 0, y: 0 });
      return;
    }

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (g.mode === "decide") {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        g.mode = Math.abs(dy) > Math.abs(dx) ? "dismiss" : "swipe";
      }
    }
    if (g.mode === "pan") {
      setPan({ x: g.panX + dx, y: g.panY + dy });
    } else if (g.mode === "dismiss") {
      setDrag(Math.max(0, dy));
    } else if (g.mode === "swipe") {
      g.dx = dx;
    }
  };

  const endGesture = (e) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;
    if (pointers.current.size > 0) {
      // second finger lifted after pinch — settle
      if (zoom <= 1.01) setPan({ x: 0, y: 0 });
      gesture.current = null;
      return;
    }
    if (g.mode === "swipe" && Math.abs(g.dx || 0) > 55) {
      (g.dx < 0 ? goNext : goPrev)();
    } else if (g.mode === "dismiss") {
      if (drag > 110) onClose();
      else setDrag(0);
    } else if (g.mode === "pinch" && zoom <= 1.05) {
      resetView();
    }
    gesture.current = null;
  };

  const onDoubleClick = (e) => {
    e.stopPropagation();
    setZoom((z) => (z > 1.01 ? 1 : 2.4));
    setPan({ x: 0, y: 0 });
  };

  // Single-finger double-tap (touch) — dblclick doesn't fire reliably on mobile.
  const onStagePointerUp = (e) => {
    const now = e.timeStamp;
    if (now - lastTap.current < 300 && pointers.current.size === 0) {
      onDoubleClick(e);
    }
    lastTap.current = now;
    endGesture(e);
  };

  const onWheel = (e) => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
    e.preventDefault();
    setZoom((z) => {
      const nz = clamp(z - e.deltaY * 0.002, 1, MAX_ZOOM);
      if (nz <= 1.01) setPan({ x: 0, y: 0 });
      return nz;
    });
  };

  const backdropOpacity = 1 - clamp(drag / 500, 0, 0.75);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt || "Photo"}
      ref={dialogRef}
      onClick={onClose}
      style={{ "--backdrop": backdropOpacity }}
    >
      {/* Screen-reader announcement of the current photo. */}
      <p className="lightbox__live" aria-live="polite">
        {`Photo ${index + 1} of ${count}${photo.caption || photo.alt ? `: ${photo.caption || photo.alt}` : ""}`}
      </p>

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
        className={`lightbox__stage ${anim ? `is-${anim}` : ""} ${zoomed ? "is-zoomed" : ""} ${drag ? "is-dragging" : ""}`}
        key={photo.id}
        style={{ transform: `translateY(${drag}px)` }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={onDoubleClick}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={endGesture}
      >
        {hasImage ? (
          <ResolvedImg
            className="lightbox__img"
            src={photo.src}
            alt={photo.alt || ""}
            decoding="async"
            draggable="false"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          />
        ) : (
          <span
            className="lightbox__placeholder"
            style={{ background: toneGradient(photo.tone), aspectRatio: photo.ratio || "3/4" }}
            aria-hidden="true"
          />
        )}
        {(photo.caption || photo.alt) && !zoomed && (
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
        <div className="lightbox__bottom" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`lightbox__slideshow ${slideshow ? "is-on" : ""}`}
            onClick={() => setSlideshow((v) => !v)}
            aria-pressed={slideshow}
            aria-label={slideshow ? "Pause slideshow" : "Play slideshow"}
          >
            {slideshow ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z" fill="currentColor" /></svg>
            )}
            <span>{slideshow ? "Pause" : "Slideshow"}</span>
          </button>
          <span className="lightbox__counter" aria-hidden="true">
            {index + 1} / {count}
          </span>
        </div>
      ) : null}
    </div>
  );
}
