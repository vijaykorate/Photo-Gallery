import { getImage, putImage, getAudio, putAudio } from "./audioStore.js";

// Backup / restore the whole gallery to a single file — so edits can be moved
// between devices (e.g. phone → computer) and never lost. The file bundles the
// content (text + structure) plus every uploaded photo and song.
const STORAGE_KEY = "photo-gallery/content/v2";

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve(null);
    r.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

// Gather content + all referenced IndexedDB images/songs into one object.
export async function buildBackup(content) {
  const json = JSON.stringify(content);
  const imageIds = [...new Set((json.match(/idb:([A-Za-z0-9_-]+)/g) || []).map((s) => s.slice(4)))];
  const audioIds = (content.music?.tracks || []).filter((t) => t.kind === "file").map((t) => t.id);

  const images = {};
  for (const id of imageIds) {
    const b = await getImage(id);
    if (b) images[id] = await blobToDataUrl(b);
  }
  const audio = {};
  for (const id of audioIds) {
    const b = await getAudio(id);
    if (b) audio[id] = await blobToDataUrl(b);
  }
  return { app: "photo-gallery", version: 1, savedAt: new Date().toISOString(), content, images, audio };
}

export function downloadBackup(obj) {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "memories-backup.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// Restore a backup file: write its images/songs back into IndexedDB and its
// content into localStorage. Caller should reload the page afterwards.
export async function restoreBackup(file) {
  const text = await file.text();
  const obj = JSON.parse(text);
  if (!obj || !obj.content || !Array.isArray(obj.content.groups)) {
    throw new Error("That doesn't look like a memories backup file.");
  }
  for (const [id, dataUrl] of Object.entries(obj.images || {})) {
    try {
      await putImage(id, await dataUrlToBlob(dataUrl));
    } catch {
      /* skip a bad entry */
    }
  }
  for (const [id, dataUrl] of Object.entries(obj.audio || {})) {
    try {
      await putAudio(id, await dataUrlToBlob(dataUrl));
    } catch {
      /* skip */
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj.content));
  return true;
}
