import { useRef, useState } from "react";
import { useReveal } from "../hooks/useReveal.js";
import { toneGradient } from "../lib/gradient.js";
import { resizeToBlob } from "../lib/resizeImage.js";
import { storeImage } from "../lib/storeImage.js";
import ResolvedImg from "./ResolvedImg.jsx";
import { useEdit } from "./edit/EditContext.jsx";
import "./PhotoCard.css";

// A single masonry tile.
//  • View mode: lazy image (gradient fallback), optional caption overlay,
//    subtle hover zoom, opens the lightbox on click / Enter / Space.
//  • Edit mode: caption text field + remove / reorder controls.
export default function PhotoCard({ photo, groupId, onOpen, index = 0 }) {
  const edit = useEdit();
  const editing = edit?.editing;
  const [ref, visible] = useReveal();
  // Cascade: each tile reveals a touch after the previous one (capped).
  const revealDelay = `${Math.min(index * 0.06, 0.5)}s`;
  const [failed, setFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const replaceInput = useRef(null);

  const replacePhoto = async (fileList) => {
    const file = Array.from(fileList || []).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    const { blob, width, height } = await resizeToBlob(file);
    const src = blob ? await storeImage(blob, edit.token) : photo.src;
    edit.updatePhoto(groupId, photo.id, {
      src,
      ratio: width && height ? `${width}/${height}` : photo.ratio,
    });
    if (replaceInput.current) replaceInput.current.value = "";
  };

  const hasImage = Boolean(photo.src) && !failed;
  const ratio = photo.ratio || "3/4";

  const media = hasImage ? (
    <ResolvedImg
      className="photo-card__img"
      src={photo.src}
      alt={photo.alt || ""}
      loading="lazy"
      decoding="async"
      draggable="false"
      onError={() => setFailed(true)}
      onReady={() => setImgLoaded(true)}
      style={{
        objectFit: photo.fit || "cover",
        objectPosition: `${photo.posX ?? 50}% 50%`,
        "--zoom": photo.zoom || 1,
      }}
    />
  ) : (
    <span
      className="photo-card__placeholder"
      style={{ background: toneGradient(photo.tone) }}
      aria-hidden="true"
    />
  );

  // Shimmer skeleton shown until the real image has decoded (no layout shift —
  // the frame already reserves space via aspect-ratio).
  const skeleton =
    hasImage && !imgLoaded ? <span className="photo-card__skeleton" aria-hidden="true" /> : null;

  // ---- Edit mode ----
  if (editing) {
    return (
      <figure ref={ref} className={`photo-card is-editing reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: revealDelay }}>
        <div className="photo-card__frame" style={{ aspectRatio: ratio }}>
          {skeleton}
          {media}
          <div className="photo-card__edit" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="photo-card__remove"
              onClick={() => edit.removePhoto(groupId, photo.id)}
              aria-label="Delete photo"
            >
              ×
            </button>
            <label className="photo-card__replace" aria-label="Replace photo">
              <input ref={replaceInput} type="file" accept="image/*" hidden onChange={(e) => replacePhoto(e.target.files)} />
              ⟳
            </label>
            <div className="photo-card__moves">
              <button type="button" onClick={() => edit.movePhoto(groupId, photo.id, -1)} aria-label="Move left">‹</button>
              <button type="button" onClick={() => edit.movePhoto(groupId, photo.id, 1)} aria-label="Move right">›</button>
            </div>
          </div>
        </div>
        <input
          type="text"
          className="photo-card__caption-input"
          value={photo.caption || ""}
          placeholder="Name this photo…"
          aria-label="Photo name"
          onChange={(e) => edit.updatePhoto(groupId, photo.id, { caption: e.target.value })}
        />
        <div className="photo-card__adjust">
          <button
            type="button"
            className="photo-card__fit"
            onClick={() =>
              edit.updatePhoto(groupId, photo.id, {
                fit: (photo.fit || "cover") === "cover" ? "contain" : "cover",
              })
            }
          >
            {(photo.fit || "cover") === "cover" ? "Fill" : "Fit"}
          </button>
          <input
            type="range"
            className="photo-card__zoom"
            min="1"
            max="2.5"
            step="0.05"
            value={photo.zoom || 1}
            aria-label="Zoom"
            onChange={(e) => edit.updatePhoto(groupId, photo.id, { zoom: Number(e.target.value) })}
          />
        </div>
        <div className="photo-card__adjust">
          <span className="photo-card__adjust-label" aria-hidden="true">↔</span>
          <input
            type="range"
            className="photo-card__zoom"
            min="0"
            max="100"
            step="1"
            value={photo.posX ?? 50}
            aria-label="Move photo left or right"
            title="Move photo left / right"
            onChange={(e) => edit.updatePhoto(groupId, photo.id, { posX: Number(e.target.value) })}
          />
        </div>
      </figure>
    );
  }

  // ---- View mode ----
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <figure ref={ref} className={`photo-card reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: revealDelay }}>
      <div className="photo-card__frame" style={{ aspectRatio: ratio }}>
        {skeleton}
        <button
          type="button"
          className="photo-card__button"
          onClick={onOpen}
          onKeyDown={handleKey}
          aria-label={`Open photo: ${photo.caption || photo.alt || "memory"}`}
        >
          {media}
        </button>
      </div>
      {(photo.caption || photo.alt) ? (
        <figcaption className="photo-card__caption-below">{photo.caption || photo.alt}</figcaption>
      ) : null}
    </figure>
  );
}
