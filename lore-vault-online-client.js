async function vaultApi(url, options = {}) { const r = await fetch(url, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Vault request failed"); return d; }

window.TidefallVaultOnline = { vaultApi };
