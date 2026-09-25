// Talks to the Netlify Functions backend. When the site is served without the
// functions (plain `vite`), these fail gracefully and the app falls back to
// local storage — so nothing breaks in local-only mode.

const FN = "/.netlify/functions";

export async function loadContent() {
  try {
    const res = await fetch(`${FN}/content`, { cache: "no-store" });
    if (res.status === 404) return null; // nothing saved yet
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // server not available (local-only mode)
  }
}

export async function saveContent(content, token) {
  if (!token) return false;
  try {
    const res = await fetch(`${FN}/content`, {
      method: "PUT",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(content),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function uploadImage(blob, token) {
  if (!token) return null;
  try {
    const res = await fetch(`${FN}/image`, {
      method: "PUT",
      headers: { "content-type": "image/jpeg", authorization: `Bearer ${token}` },
      body: blob,
    });
    if (!res.ok) return null;
    const { id } = await res.json();
    return id || null;
  } catch {
    return null;
  }
}

export function imageUrl(id) {
  return `${FN}/image?id=${encodeURIComponent(id)}`;
}

// ---- Netlify Image CDN helpers ----------------------------------------------
// Serve photos small, in a modern format, sized to the screen. Works for our
// server-hosted (srv:) and baked (/images/*) photos. Local browser images
// (idb:) and data URLs can't be transformed, so these return null and callers
// fall back to the original. If the CDN itself isn't available (e.g. plain
// `vite preview`), ResolvedImg retries with the untransformed source.
function cdnSource(src) {
  if (typeof src !== "string") return null;
  if (src.startsWith("srv:")) return `${FN}/image?id=${encodeURIComponent(src.slice(4))}`;
  if (src.startsWith("/images/")) return src;
  return null;
}

export function cdnUrl(src, w, q = 72) {
  const s = cdnSource(src);
  if (!s) return null;
  return `/.netlify/images?url=${encodeURIComponent(s)}&w=${w}&q=${q}`;
}

export function cdnSrcSet(src, widths, q = 72) {
  const s = cdnSource(src);
  if (!s) return null;
  return widths
    .map((w) => `/.netlify/images?url=${encodeURIComponent(s)}&w=${w}&q=${q} ${w}w`)
    .join(", ");
}

export async function login(password) {
  try {
    const res = await fetch(`${FN}/auth`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return { ok: false, error: error || "Login failed." };
    }
    const { token } = await res.json();
    return { ok: true, token };
  } catch {
    return { ok: false, error: "Server not reachable (local-only mode)." };
  }
}
