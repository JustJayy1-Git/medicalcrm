# Database setup (Supabase)

## Two different passwords (common confusion)

| What | Used for | `.env.local` variable |
|------|----------|------------------------|
| **API keys** | Next.js app (login, patients, cases) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` |
| **Database password** | CLI / running SQL migrations only | `SUPABASE_DB_PASSWORD` |

Resetting the **database password** in Supabase does **not** change your API keys, and vice versa.

The app **never** reads `SUPABASE_DB_PASSWORD` at runtime — only migration scripts do.

## Apply migration 0012 (Florida insurance carriers)

### Option A — SQL Editor (simplest, no CLI)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Open `supabase/migrations/0012_fl_common_carriers.sql` in this repo.
3. Copy the full file, paste into a new query, click **Run**.
4. Refresh the app → **Insurance** should show carriers with **FL common** badges.

### Option B — From WSL (uses `SUPABASE_DB_PASSWORD`)

```bash
cd ~/projects/medicalcrm
npm install
npm run db:migrate-0012
npm run db:check
```

### Verify

```bash
npm run db:check
```

You should see `Migration 0012 columns: OK` and ~15 FL common carriers.

## Apply migration 0013 (office PDF templates)

Run `supabase/migrations/0013_document_templates.sql` in the SQL Editor.

Creates the **Templates** tab library (`document_templates` table + `office-templates` storage bucket).

## If something breaks after a password reset

1. **App won't load data** → re-copy **Project URL**, **publishable key**, and **secret key** from Supabase → **Settings → API** into `.env.local`.
2. **Migration fails with "password authentication failed"** → reset **database password** under **Settings → Database**, update `SUPABASE_DB_PASSWORD`, retry.
3. Restart dev server after editing `.env.local`: `npm run dev`
