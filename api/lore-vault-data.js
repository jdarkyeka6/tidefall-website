import crypto from "node:crypto";

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function isValidSession(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)tidefall_vault=([^;]+)/);
  if (!match) return false;
  const [expires, signature] = decodeURIComponent(match[1]).split(".");
  const secret = process.env.TIDEFALL_VAULT_SESSION_SECRET;
  if (!secret || !expires || !signature || Number(expires) < Date.now()) return false;
  const expected = sign(expires, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const categories = ["canon", "relationships", "characters", "families", "academy", "magic", "story", "ideas", "scrapped"];

async function supabaseRequest(path, options = {}) {
  // Support the names commonly already used by Tidefall deployments, while
  // keeping the service key strictly server-side.
  const url = process.env.TIDEFALL_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.TIDEFALL_SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase storage is not configured in Vercel");
  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
}

export default async function handler(req, res) {
  if (!isValidSession(req)) return res.status(401).json({ error: "Unauthorized" });
  const category = req.query?.category;
  if (!categories.includes(category)) return res.status(400).json({ error: "Invalid category" });

  try {
    if (req.method === "GET") {
      const response = await supabaseRequest(`tidefall_lore_vault_entries?select=id,category,content,updated_at&category=eq.${encodeURIComponent(category)}&limit=1`);
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data?.message || "Database read failed" });
      return res.status(200).json({ entry: data[0] || { category, content: "" } });
    }

    if (req.method === "PUT") {
      const content = typeof req.body?.content === "string" ? req.body.content : "";
      const response = await supabaseRequest("tidefall_lore_vault_entries?on_conflict=category", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ category, content, updated_at: new Date().toISOString() })
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data?.message || "Database save failed" });
      return res.status(200).json({ entry: data[0] });
    }

    if (req.method === "DELETE") {
      const response = await supabaseRequest(`tidefall_lore_vault_entries?category=eq.${encodeURIComponent(category)}`, { method: "DELETE" });
      if (!response.ok) return res.status(response.status).json({ error: "Database delete failed" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(503).json({ error: error.message || "Vault storage unavailable" });
  }
}
