import { makeToken } from "./_auth.js";

// POST { password } -> { token }.  Verifies against the EDIT_PASSWORD env var.
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const real = process.env.EDIT_PASSWORD || "";
  if (!real) return Response.json({ error: "Editing is not configured on the server." }, { status: 500 });
  const { password } = await req.json().catch(() => ({}));
  if (password !== real) return Response.json({ error: "Wrong password." }, { status: 401 });
  return Response.json({ token: makeToken() });
};
