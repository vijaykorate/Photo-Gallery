import { useEffect, useState } from "react";
import { getImage } from "../lib/audioStore.js";
import { imageUrl } from "../lib/server.js";

// Renders an <img> from any of our src forms:
//   "/images/.." or "data:.."  -> used directly
//   "srv:<id>"                  -> served from the Netlify backend
//   "idb:<id>"                  -> loaded from IndexedDB (local) into an object URL
function normalize(src) {
  if (typeof src === "string" && src.startsWith("srv:")) return imageUrl(src.slice(4));
  return src;
}

export default function ResolvedImg({ src, alt = "", ...rest }) {
  const isIdb = typeof src === "string" && src.startsWith("idb:");
  const [url, setUrl] = useState(isIdb ? null : normalize(src));

  useEffect(() => {
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

  if (!url) return null;
  return <img src={url} alt={alt} {...rest} />;
}
