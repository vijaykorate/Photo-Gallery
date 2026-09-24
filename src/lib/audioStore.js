// IndexedDB storage for large media (song audio AND photo images). Browsers
// give IndexedDB far more room than localStorage (~5MB), so uploaded photos and
// songs live here while only lightweight references/metadata go in localStorage.
// Everything is on-device; nothing is uploaded anywhere.

const DB_NAME = "photo-gallery";
const DB_VERSION = 2;
const AUDIO = "audio";
const IMAGES = "images";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(AUDIO)) db.createObjectStore(AUDIO);
      if (!db.objectStoreNames.contains(IMAGES)) db.createObjectStore(IMAGES);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(storeName, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const request = fn(store);
    t.oncomplete = () => resolve(request?.result ?? request);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

// ---- Audio (songs) ----
export const putAudio = (id, blob) => run(AUDIO, "readwrite", (s) => s.put(blob, id));
export const getAudio = (id) => run(AUDIO, "readonly", (s) => s.get(id));
export const deleteAudio = (id) => run(AUDIO, "readwrite", (s) => s.delete(id));

// ---- Images (photos) ----
export const putImage = (id, blob) => run(IMAGES, "readwrite", (s) => s.put(blob, id));
export const getImage = (id) => run(IMAGES, "readonly", (s) => s.get(id));
export const deleteImage = (id) => run(IMAGES, "readwrite", (s) => s.delete(id));
