import { useRef, useState } from "react";
import { useReveal } from "../hooks/useReveal.js";
import { toneGradient } from "../lib/gradient.js";
import { resizeImage } from "../lib/resizeImage.js";
import { useEdit } from "./edit/EditContext.jsx";
import EditableText from "./edit/EditableText.jsx";
import "./Footer.css";

// The closing section: a full-width photo with a short, personal message.
export default function Footer() {
  const { content, setClosing, editing } = useEdit();
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
      const { src } = await resizeImage(file, { maxEdge: 2000 });
      setClosing({ photo: { src, alt: closing.photo?.alt || "" } });
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
          <img
            className="closing__img"
            src={photo.src}
            alt={photo.alt || ""}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        ) : null}
        <div className="closing__scrim" aria-hidden="true" />
      </div>

      {editing ? (
        <label className={`change-photo ${busy ? "is-busy" : ""}`}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => changePhoto(e.target.files)} />
          {busy ? "Uploading…" : "Change photo"}
        </label>
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
