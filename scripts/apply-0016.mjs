/**
 * Apply migration 0016_profiles_kiosk_read.sql
 * Run: npm run db:migrate-0016
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) throw new Error(".env.local not found");
  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return vars;
}

function projectRef(supabaseUrl) {
  return new URL(supabaseUrl).hostname.replace(".supabase.co", "");
}

async function main() {
  const env = loadEnvLocal();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const password = env.SUPABASE_DB_PASSWORD || env.DATABASE_PASSWORD;

  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing in .env.local");
  if (!password) {
    throw new Error(
      "SUPABASE_DB_PASSWORD missing — Supabase → Settings → Database → database password",
    );
  }

  const ref = projectRef(supabaseUrl);
  // Default to Supabase Transaction Pooler (IPv4-friendly, works from WSL2).
  // Override via DATABASE_URL or SUPABASE_DB_HOST if needed.
  const poolerHost = env.SUPABASE_DB_HOST || `aws-0-us-east-1.pooler.supabase.com`;
  const connectionString =
    env.DATABASE_URL ||
    `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${poolerHost}:6543/postgres`;

  const sqlPath = resolve(root, "supabase/migrations/0016_profiles_kiosk_read.sql");
  const sql = readFileSync(sqlPath, "utf8");

  console.log(`Applying 0016_profiles_kiosk_read.sql to ${ref}…`);
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log("OK — kiosk users can now read their own profile.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
