import { useEffect, useRef, useState } from "react";
import { getImage } from "../lib/audioStore.js";
import { imageUrl, cdnUrl, cdnSrcSet } from "../lib/server.js";

// Renders an <img> from any of our src forms:
//   "/images/.." or "data:.."  -> used directly (static served via Image CDN)
//   "srv:<id>"                  -> served from the Netlify backend / Image CDN
//   "idb:<id>"                  -> loaded from IndexedDB (local) into an object URL
//
// When `widths` is given, the image is served through the Netlify Image CDN at
// screen-appropriate sizes in a modern format (much smaller / faster). If the
// CDN isn't available (e.g. plain `vite preview`) or errors, we retry once with
// the untransformed source, then fall back to the caller's onError.
//
// The image fades in once it has decoded, so tiles can show a skeleton until then.
function normalize(src) {
  if (typeof src === "string" && src.startsWith("srv:")) return imageUrl(src.slice(4));
  return src;
}

export default function ResolvedImg({
  src,
  alt = "",
  className = "",
  widths,
  sizes,
  quality = 72,
  onReady,
  onLoad,
  onError,
  ...rest
}) {
  const isIdb = typeof src === "string" && src.startsWith("idb:");
  const [idbUrl, setIdbUrl] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [cdnOff, setCdnOff] = useState(false); // set true if the CDN request fails
  const imgRef = useRef(null);

  // Resolve IndexedDB blobs to temporary object URLs.
  useEffect(() => {
    setLoaded(false);
    setCdnOff(false);
    if (!isIdb) {
      setIdbUrl(null);
      return;
    }
    let objectUrl = null;
    let cancelled = false;
    getImage(src.slice(4))
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setIdbUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, isIdb]);

  // Cached images may already be complete before React wires onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) markLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idbUrl, cdnOff, src]);

  function markLoaded() {
    setLoaded(true);
    onReady?.();
  }

  // Work out the URL(s) to use.
  let url = null;
  let srcSet;
  const useCdn = !isIdb && !cdnOff && Array.isArray(widths) && widths.length > 0;
  if (isIdb) {
    url = idbUrl;
  } else if (useCdn) {
    const mid = widths[Math.floor(widths.length / 2)];
    url = cdnUrl(src, mid, quality) || normalize(src);
    srcSet = cdnSrcSet(src, widths, quality) || undefined;
  } else {
    url = normalize(src);
  }

  if (!url) return null;
  return (
    <img
      ref={imgRef}
      src={url}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={`rimg ${loaded ? "is-loaded" : ""} ${className}`.trim()}
      onLoad={(e) => {
        markLoaded();
        onLoad?.(e);
      }}
      onError={(e) => {
        // First failure while using the CDN: retry with the plain source.
        if (useCdn) {
          setCdnOff(true);
          return;
        }
        onError?.(e);
      }}
      {...rest}
    />
  );
}
