import { getStore } from "@netlify/blobs";
import { checkAuth } from "./_auth.js";
import crypto from "node:crypto";

// GET ?id=  -> stream the stored image bytes
// PUT (raw image body, owner token) -> store it, returns { id }
export default async (req) => {
  const store = getStore("gallery-images");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const id = url.searchParams.get("id");
    if (!id) return new Response("missing id", { status: 400 });
    const buf = await store.get(`img/${id}`, { type: "arrayBuffer" });
    if (!buf) return new Response("not found", { status: 404 });
    return new Response(buf, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (req.method === "PUT" || req.method === "POST") {
    if (!checkAuth(req)) return new Response("Unauthorized", { status: 401 });
    const buf = await req.arrayBuffer();
    if (!buf || buf.byteLength === 0) return new Response("empty", { status: 400 });
    const id = crypto.randomUUID();
    await store.set(`img/${id}`, buf);
    return Response.json({ id });
  }

  return new Response("Method not allowed", { status: 405 });
};
