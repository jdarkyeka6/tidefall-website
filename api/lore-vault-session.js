import crypto from "node:crypto";

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function validSession(cookie, secret) {
  const match = cookie?.match(/(?:^|;\s*)tidefall_vault=([^;]+)/);
  if (!match) return false;
  const [expires, signature] = decodeURIComponent(match[1]).split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = sign(expires, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export default function handler(req, res) {
  const secret = process.env.TIDEFALL_VAULT_SESSION_SECRET;
  if (!secret) return res.status(503).json({ error: "Vault is not configured" });
  return validSession(req.headers.cookie || "", secret)
    ? res.status(200).json({ authenticated: true })
    : res.status(401).json({ authenticated: false });
}
