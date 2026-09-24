import { getStore } from "@netlify/blobs";
import { checkAuth } from "./_auth.js";

// GET  -> the saved gallery content JSON (404 if none yet -> client uses defaults)
// PUT  -> save the content JSON (owner token required)
export default async (req) => {
  const store = getStore("gallery");

  if (req.method === "GET") {
    const data = await store.get("content", { type: "json" });
    if (!data) return new Response(null, { status: 404 });
    return Response.json(data);
  }

  if (req.method === "PUT" || req.method === "POST") {
    if (!checkAuth(req)) return new Response("Unauthorized", { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.groups)) return new Response("Bad content", { status: 400 });
    await store.setJSON("content", body);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};
