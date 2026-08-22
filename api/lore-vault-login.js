import crypto from "node:crypto";

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const expected = process.env.TIDEFALL_VAULT_PASSWORD;
  const secret = process.env.TIDEFALL_VAULT_SESSION_SECRET;

  if (!expected || !secret) {
    return res.status(503).json({ error: "Vault is not configured" });
  }

  const passwordBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);
  const valid = passwordBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(passwordBuffer, expectedBuffer);

  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = String(expires);
  const token = `${payload}.${sign(payload, secret)}`;

  res.setHeader("Set-Cookie", `tidefall_vault=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);
  return res.status(200).json({ ok: true });
}
