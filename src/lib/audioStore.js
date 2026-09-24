// Tiny IndexedDB helper for storing uploaded song files (audio blobs).
// Songs are several MB each — far too big for localStorage — so the audio
// itself lives here, while lightweight track metadata (title/artist) stays in
// the content object. Everything is on-device; nothing is uploaded anywhere.

const DB_NAME = "photo-gallery";
const STORE = "audio";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const result = fn(store);
    t.oncomplete = () => resolve(result?.result ?? result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export function putAudio(id, blob) {
  return tx("readwrite", (store) => store.put(blob, id));
}

export function getAudio(id) {
  return tx("readonly", (store) => store.get(id));
}

export function deleteAudio(id) {
  return tx("readwrite", (store) => store.delete(id));
}
