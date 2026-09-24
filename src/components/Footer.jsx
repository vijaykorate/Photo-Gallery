import { useRef, useState } from "react";
import { useReveal } from "../hooks/useReveal.js";
import { toneGradient } from "../lib/gradient.js";
import { resizeToBlob } from "../lib/resizeImage.js";
import { storeImage } from "../lib/storeImage.js";
import ResolvedImg from "./ResolvedImg.jsx";
import { useEdit } from "./edit/EditContext.jsx";
import EditableText from "./edit/EditableText.jsx";
import "./Footer.css";

// The closing section: a full-width photo with a short, personal message.
export default function Footer() {
  const { content, setClosing, editing, token } = useEdit();
  const [ref, visible] = useReveal({ threshold: 0.3 });
  const closing = content.closing;
  const photo = closing.photo || {};
  const hasImage = Boolean(photo.src);

  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const changePhoto = async (fileList) => {
    const file = Array.from(fileList || []).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    setBusy(true);
    try {
      const { blob } = await resizeToBlob(file, { maxEdge: 2000 });
      const src = blob ? await storeImage(blob, token) : null;
      setClosing({ photo: { ...photo, src, alt: closing.photo?.alt || "" } });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <footer className="closing">
      <div
        className="closing__media"
        style={hasImage ? undefined : { background: toneGradient(["#3a2b52", "#7c53b8"]) }}
      >
        {hasImage ? (
          <ResolvedImg
            className="closing__img"
            src={photo.src}
            alt={photo.alt || ""}
            loading="lazy"
            decoding="async"
            draggable="false"
            style={{ transform: `scale(${photo.zoom || 1})`, objectPosition: `50% ${photo.posY ?? 50}%` }}
          />
        ) : null}
        <div className="closing__scrim" aria-hidden="true" />
      </div>

      {editing ? (
        <div className="closing__edit">
          <label className={`change-photo ${busy ? "is-busy" : ""}`}>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => changePhoto(e.target.files)} />
            {busy ? "Uploading…" : "Change photo"}
          </label>
          <div className="closing__adjust">
            <label className="closing__slider">
              <span>Zoom</span>
              <input
                type="range" min="1" max="2.5" step="0.05"
                value={photo.zoom || 1}
                aria-label="Photo zoom"
                onChange={(e) => setClosing({ photo: { ...photo, zoom: Number(e.target.value) } })}
              />
            </label>
            <label className="closing__slider">
              <span>Position</span>
              <input
                type="range" min="0" max="100" step="1"
                value={photo.posY ?? 50}
                aria-label="Photo vertical position"
                onChange={(e) => setClosing({ photo: { ...photo, posY: Number(e.target.value) } })}
              />
            </label>
          </div>
        </div>
      ) : null}

      <div
        ref={ref}
        className={`closing__content container reveal ${visible ? "is-visible" : ""}`}
      >
        {(closing.message || editing) && (
          <p className="closing__message">
            <EditableText
              editing={editing}
              value={closing.message}
              onChange={(v) => setClosing({ message: v })}
              placeholder="A short closing message"
              multiline
              ariaLabel="Closing message"
            />
          </p>
        )}
        {(closing.signature || editing) && (
          <p className="closing__signature">
            <EditableText
              editing={editing}
              value={closing.signature}
              onChange={(v) => setClosing({ signature: v })}
              placeholder="— a signature"
              ariaLabel="Signature"
            />
          </p>
        )}
      </div>
    </footer>
  );
}
