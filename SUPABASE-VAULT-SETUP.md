# Tidefall Lore Vault storage

The Lore Vault stores notes in the `tidefall_lore_vault_entries` Supabase table.

Vercel needs these environment variables:
- `TIDEFALL_SUPABASE_URL` = the Tidefall Supabase project URL
- `TIDEFALL_SUPABASE_SECRET_KEY` = the Supabase secret/server key, stored as a sensitive Production variable

Never put the Supabase secret key in browser code.
