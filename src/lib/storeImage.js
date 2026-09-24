import { putImage } from "./audioStore.js";
import { uploadImage } from "./server.js";

// Stores an image blob and returns the src string to save in content:
//   signed-in owner -> uploaded to the server  -> "srv:<id>"
//   otherwise       -> kept locally (IndexedDB) -> "idb:<id>"
export async function storeImage(blob, token) {
  if (token) {
    const id = await uploadImage(blob, token);
    if (id) return `srv:${id}`;
  }
  const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await putImage(id, blob);
  return `idb:${id}`;
}

export default storeImage;
