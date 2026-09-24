import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultContent } from "../data/defaults.js";
import { putImage } from "../lib/audioStore.js";

// One editable content object (hero + closing + trip/occasion groups) kept in
// the browser's localStorage. Everything the owner edits on screen flows
// through here and persists on their device — nothing is sent anywhere.
const STORAGE_KEY = "photo-gallery/content/v2";

function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function clone(obj) {
  return typeof structuredClone === "function"
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));
}

function readContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultContent);
    const parsed = JSON.parse(raw);
    // Basic shape guard — fall back to defaults if it looks wrong.
    if (!parsed || !Array.isArray(parsed.groups) || !parsed.hero) return clone(defaultContent);
    // Forward-compat: make sure newer blocks/fields exist.
    if (!parsed.music) parsed.music = clone(defaultContent.music);
    if (!Array.isArray(parsed.music.tracks)) parsed.music.tracks = clone(defaultContent.music.tracks);
    if (!("cover" in parsed.music)) parsed.music.cover = null;
    if (!parsed.intro) parsed.intro = clone(defaultContent.intro);
    if (!("eyebrow" in parsed.hero)) parsed.hero.eyebrow = defaultContent.hero.eyebrow;
    return parsed;
  } catch {
    return clone(defaultContent);
  }
}

export function useContent() {
  const [content, setContent] = useState(() =>
    typeof window === "undefined" ? clone(defaultContent) : readContent()
  );
  const [storageError, setStorageError] = useState(false);

  // Keep other tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setContent(readContent());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Apply a transform to a fresh copy of the content, then persist it.
  const commit = useCallback((mutate) => {
    setContent((prev) => {
      const next = clone(prev);
      mutate(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setStorageError(false);
      } catch {
        setStorageError(true); // quota exceeded / unavailable
      }
      return next;
    });
  }, []);

  // One-time migration: older galleries stored photos as big data URLs inside
  // localStorage (which caps at ~5MB and could overflow). Move any such images
  // into IndexedDB (roomy) and replace them with lightweight references, so a
  // large gallery can never overflow again. Runs once, then no-ops.
  const migrated = useRef(false);
  useEffect(() => {
    if (migrated.current) return;
    migrated.current = true;
    (async () => {
      const src0 = JSON.stringify(content);
      const hasDataUrls = src0.includes("data:image");
      const hasDummyTracks = (content.music?.tracks || []).some((t) => t.kind === "builtin");
      if (!hasDataUrls && !hasDummyTracks) return; // nothing to clean up
      const next = clone(content);
      const move = async (obj) => {
        if (obj && typeof obj.src === "string" && obj.src.startsWith("data:image")) {
          try {
            const blob = await (await fetch(obj.src)).blob();
            const id = uid("img");
            await putImage(id, blob);
            obj.src = `idb:${id}`;
          } catch {
            /* leave as-is on failure */
          }
        }
      };
      for (const g of next.groups) for (const ph of g.photos) await move(ph);
      if (next.hero?.photo) await move(next.hero.photo);
      if (next.closing?.photo) await move(next.closing.photo);
      if (next.music?.cover) await move(next.music.cover);
      // Drop the old placeholder (dummy) songs — the owner adds their own.
      if (next.music?.tracks) next.music.tracks = next.music.tracks.filter((t) => t.kind !== "builtin");
      commit((c) => {
        c.groups = next.groups;
        c.hero = next.hero;
        c.closing = next.closing;
        c.music = next.music;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findGroup = (c, id) => c.groups.find((g) => g.id === id);

  const setHero = useCallback((patch) => commit((c) => Object.assign(c.hero, patch)), [commit]);
  const setClosing = useCallback((patch) => commit((c) => Object.assign(c.closing, patch)), [commit]);
  const setMusic = useCallback((patch) => commit((c) => Object.assign(c.music, patch)), [commit]);
  const setIntro = useCallback((patch) => commit((c) => Object.assign(c.intro, patch)), [commit]);

  const addTrack = useCallback(
    (meta) => commit((c) => c.music.tracks.push({ id: uid("t"), kind: "file", title: "New song", artist: "", ...meta })),
    [commit]
  );
  const updateTrack = useCallback(
    (id, patch) => commit((c) => { const t = c.music.tracks.find((x) => x.id === id); if (t) Object.assign(t, patch); }),
    [commit]
  );
  const removeTrack = useCallback(
    (id) => commit((c) => { c.music.tracks = c.music.tracks.filter((x) => x.id !== id); }),
    [commit]
  );

  const addGroup = useCallback(
    (kind = "trip") =>
      commit((c) =>
        c.groups.push({
          id: uid("g"),
          kind,
          title: kind === "trip" ? "New Trip" : "New Occasion",
          note: "",
          photos: [],
        })
      ),
    [commit]
  );

  const updateGroup = useCallback(
    (id, patch) => commit((c) => { const g = findGroup(c, id); if (g) Object.assign(g, patch); }),
    [commit]
  );

  const removeGroup = useCallback(
    (id) => commit((c) => { c.groups = c.groups.filter((g) => g.id !== id); }),
    [commit]
  );

  const moveGroup = useCallback(
    (id, dir) =>
      commit((c) => {
        const i = c.groups.findIndex((g) => g.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= c.groups.length) return;
        [c.groups[i], c.groups[j]] = [c.groups[j], c.groups[i]];
      }),
    [commit]
  );

  // photos = array of { src, alt, ratio, caption } (already resized/compact).
  const addPhotos = useCallback(
    (groupId, photos) =>
      commit((c) => {
        const g = findGroup(c, groupId);
        if (g) g.photos.push(...photos.map((p) => ({ id: uid("p"), caption: "", ...p })));
      }),
    [commit]
  );

  const updatePhoto = useCallback(
    (groupId, photoId, patch) =>
      commit((c) => {
        const g = findGroup(c, groupId);
        const ph = g && g.photos.find((p) => p.id === photoId);
        if (ph) Object.assign(ph, patch);
      }),
    [commit]
  );

  const removePhoto = useCallback(
    (groupId, photoId) =>
      commit((c) => {
        const g = findGroup(c, groupId);
        if (g) g.photos = g.photos.filter((p) => p.id !== photoId);
      }),
    [commit]
  );

  const movePhoto = useCallback(
    (groupId, photoId, dir) =>
      commit((c) => {
        const g = findGroup(c, groupId);
        if (!g) return;
        const i = g.photos.findIndex((p) => p.id === photoId);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= g.photos.length) return;
        [g.photos[i], g.photos[j]] = [g.photos[j], g.photos[i]];
      }),
    [commit]
  );

  // Replace the whole content (e.g. applying content loaded from the server).
  const replaceContent = useCallback((next) => {
    if (!next || !Array.isArray(next.groups)) return;
    setContent(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  const resetAll = useCallback(() => {
    const fresh = clone(defaultContent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    setContent(fresh);
  }, []);

  const exportJson = useCallback(() => JSON.stringify(content, null, 2), [content]);

  // Flatten every gallery photo into one ordered list for the lightbox.
  const flatPhotos = useMemo(() => content.groups.flatMap((g) => g.photos), [content.groups]);

  return {
    content,
    flatPhotos,
    storageError,
    replaceContent,
    setHero,
    setClosing,
    setMusic,
    setIntro,
    addTrack,
    updateTrack,
    removeTrack,
    addGroup,
    updateGroup,
    removeGroup,
    moveGroup,
    addPhotos,
    updatePhoto,
    removePhoto,
    movePhoto,
    resetAll,
    exportJson,
  };
}

export default useContent;
