// Reads an image File, downscales it on a <canvas>, and returns a compact
// JPEG data URL plus its dimensions. This keeps big phone photos small enough
// to store in the browser (localStorage) and fast to display.
//
//   const { src, width, height } = await resizeImage(file);
//
export function resizeImage(file, { maxEdge = 1600, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode the image."));
      img.onload = () => {
        let { width, height } = img;
        // Scale the longest edge down to maxEdge (never upscale).
        const scale = Math.min(1, maxEdge / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let src;
        try {
          src = canvas.toDataURL("image/jpeg", quality);
        } catch {
          src = reader.result; // fall back to the original if canvas is tainted
        }
        resolve({ src, width, height, canvas });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Same as resizeImage but returns a compact JPEG Blob (for IndexedDB storage)
// instead of a big data URL — keeps localStorage tiny so photos never overflow.
export async function resizeToBlob(file, opts = {}) {
  const { width, height, canvas } = await resizeImage(file, opts);
  const quality = opts.quality ?? 0.82;
  const blob = await new Promise((resolve) => {
    if (canvas && canvas.toBlob) canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    else resolve(null);
  });
  return { blob, width, height };
}

export default resizeImage;
