import crypto from "node:crypto";

// Simple shared-secret auth: the owner logs in with EDIT_PASSWORD and gets a
// signed token (HMAC over a timestamp). Writes must carry a valid token.
const secret = () => process.env.EDIT_PASSWORD || "";
const MAX_AGE = 30 * 24 * 3600 * 1000; // 30 days

export function makeToken() {
  const ts = Date.now().toString();
  const sig = crypto.createHmac("sha256", secret()).update(ts).digest("hex");
  return `${ts}.${sig}`;
}

export function verifyToken(token) {
  if (!token || !secret()) return false;
  const [ts, sig] = String(token).split(".");
  if (!ts || !sig) return false;
  const expected = crypto.createHmac("sha256", secret()).update(ts).digest("hex");
  if (sig.length !== expected.length) return false;
  let ok = false;
  try {
    ok = crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
  return ok && Date.now() - Number(ts) < MAX_AGE;
}

export function checkAuth(req) {
  const h = req.headers.get("authorization") || "";
  return verifyToken(h.replace(/^Bearer\s+/i, ""));
}
