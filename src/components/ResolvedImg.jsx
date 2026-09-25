import { useEffect, useRef, useState } from "react";
import { getImage } from "../lib/audioStore.js";
import { imageUrl } from "../lib/server.js";

// Renders an <img> from any of our src forms:
//   "/images/.." or "data:.."  -> used directly
//   "srv:<id>"                  -> served from the Netlify backend
//   "idb:<id>"                  -> loaded from IndexedDB (local) into an object URL
// The image fades in once it has actually decoded (onLoad), so tiles can show a
// skeleton underneath until then — no pop-in, no layout shift.
function normalize(src) {
  if (typeof src === "string" && src.startsWith("srv:")) return imageUrl(src.slice(4));
  return src;
}

export default function ResolvedImg({ src, alt = "", className = "", onReady, onLoad, ...rest }) {
  const isIdb = typeof src === "string" && src.startsWith("idb:");
  const [url, setUrl] = useState(isIdb ? null : normalize(src));
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Resolve the URL (IndexedDB blobs become temporary object URLs).
  useEffect(() => {
    setLoaded(false);
    if (!isIdb) {
      setUrl(normalize(src));
      return;
    }
    let objectUrl = null;
    let cancelled = false;
    getImage(src.slice(4))
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, isIdb]);

  // Cached images may already be complete before React wires onLoad — catch that.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) markLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function markLoaded() {
    setLoaded(true);
    onReady?.();
  }

  if (!url) return null;
  return (
    <img
      ref={imgRef}
      src={url}
      alt={alt}
      className={`rimg ${loaded ? "is-loaded" : ""} ${className}`.trim()}
      onLoad={(e) => {
        markLoaded();
        onLoad?.(e);
      }}
      {...rest}
    />
  );
}
