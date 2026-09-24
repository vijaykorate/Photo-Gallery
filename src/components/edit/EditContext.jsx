import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useContent } from "../../hooks/useContent.js";
import { defaultContent } from "../../data/defaults.js";
import { loadContent, saveContent } from "../../lib/server.js";

// Bundles the editable content store with an "editing" flag, the secret
// "unlocked" flag, and the owner auth "token". Also handles two-way server
// sync (Netlify Blobs): load the shared content on start, and auto-save edits
// (debounced) when the owner is signed in. Songs are kept LOCAL (not synced).
const EditContext = createContext(null);

export function useEdit() {
  return useContext(EditContext);
}

// The payload we send to the server: everything except the local-only songs.
function forServer(content) {
  return { ...content, music: { cover: content.music?.cover || null, tracks: [] } };
}

// Fill any missing blocks so partial/older server content can't break the app.
function normalize(data, localTracks) {
  const d = defaultContent;
  return {
    ...data,
    intro: data.intro || { ...d.intro },
    hero: { eyebrow: d.hero.eyebrow, ...(data.hero || {}) },
    closing: data.closing || { ...d.closing },
    music: { cover: data.music?.cover ?? null, tracks: localTracks },
    groups: Array.isArray(data.groups) ? data.groups : [],
  };
}

export function EditProvider({ children }) {
  const store = useContent();
  const [editing, setEditing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [token, setTokenState] = useState(() => {
    try {
      return sessionStorage.getItem("photo-gallery/token") || null;
    } catch {
      return null;
    }
  });
  const setToken = (t) => {
    try {
      if (t) sessionStorage.setItem("photo-gallery/token", t);
      else sessionStorage.removeItem("photo-gallery/token");
    } catch {
      /* ignore */
    }
    setTokenState(t);
  };

  const lastSynced = useRef(null);
  const loadedRef = useRef(false);
  const saveTimer = useRef(null);

  // Load the shared content from the server once (keeps local songs).
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadContent().then((data) => {
      if (!data || !Array.isArray(data.groups)) return;
      const localTracks = store.content.music?.tracks || [];
      const merged = normalize(data, localTracks);
      lastSynced.current = JSON.stringify(forServer(merged));
      store.replaceContent(merged);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-save to the server when signed in and the content changed.
  useEffect(() => {
    if (!token) return;
    const payload = forServer(store.content);
    const str = JSON.stringify(payload);
    if (str === lastSynced.current) return; // nothing new to push
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await saveContent(payload, token);
      if (ok) lastSynced.current = str;
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [store.content, token]);

  return (
    <EditContext.Provider
      value={{ ...store, editing, setEditing, unlocked, setUnlocked, token, setToken }}
    >
      {children}
    </EditContext.Provider>
  );
}

export default EditProvider;
