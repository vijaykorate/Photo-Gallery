import { useEffect, useState } from "react";
import { getImage } from "../lib/audioStore.js";

// Renders an <img> whose src may be an IndexedDB reference ("idb:<id>").
// Real paths ("/images/..") and data URLs render directly; idb references are
// loaded from IndexedDB into a temporary object URL (revoked on change/unmount).
export default function ResolvedImg({ src, alt = "", ...rest }) {
  const isIdb = typeof src === "string" && src.startsWith("idb:");
  const [url, setUrl] = useState(isIdb ? null : src);

  useEffect(() => {
    if (!isIdb) {
      setUrl(src);
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
