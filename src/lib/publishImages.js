import { getImage } from "./audioStore.js";
import { uploadImage } from "./server.js";

// Find every local (idb:) image id referenced anywhere in the content.
export function countLocalImages(content) {
  const json = JSON.stringify(content || {});
  return new Set((json.match(/idb:([A-Za-z0-9_-]+)/g) || []).map((s) => s.slice(4))).size;
}

// Upload every local (idb:) image referenced in `content` to the server and
// return a new content object that references them as srv:<id> instead. This is
// what makes an owner's gallery visible on OTHER devices — idb: images live only
// in the owner's browser, whereas srv: images are served by the backend.
//
// Owner token required (uploads are authenticated). onProgress(done, total) is
// optional. Uploads that fail keep their original idb: ref, so this is never
// destructive.
export async function publishLocalImages(content, token, onProgress) {
  if (!token) return { content, uploaded: 0, failed: 0, total: 0 };

  const json = JSON.stringify(content);
  const ids = [...new Set((json.match(/idb:([A-Za-z0-9_-]+)/g) || []).map((s) => s.slice(4)))];

  const map = {}; // idb id -> "srv:<newId>"
  let uploaded = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      const blob = await getImage(id);
      const srvId = blob ? await uploadImage(blob, token) : null;
      if (srvId) {
        map[id] = `srv:${srvId}`;
        uploaded++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    onProgress?.(uploaded + failed, ids.length);
  }

  // Rewrite refs. The ids are unique tokens, so a plain string replace over the
  // JSON safely updates every location (hero.photo, closing.photo, music.cover,
  // and each groups[].photos[]).
  let out = JSON.stringify(content);
  for (const [id, srv] of Object.entries(map)) {
    out = out.split(`idb:${id}`).join(srv);
  }

  return { content: JSON.parse(out), uploaded, failed, total: ids.length };
}

export default publishLocalImages;
