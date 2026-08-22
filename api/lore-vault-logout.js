export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  res.setHeader("Set-Cookie", "tidefall_vault=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  return res.status(200).json({ ok: true });
}
