/**
 * Apply migration 0015 (kiosk + intake packets) using SUPABASE_DB_PASSWORD from .env.local
 * Run from project root: npm run db:migrate-0015
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
  const host = new URL(supabaseUrl).hostname;
  return host.replace(".supabase.co", "");
}

async function main() {
  const env = loadEnvLocal();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const password = env.SUPABASE_DB_PASSWORD || env.DATABASE_PASSWORD;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL missing in .env.local");
  }
  if (!password) {
    throw new Error(
      "SUPABASE_DB_PASSWORD missing in .env.local — Supabase → Settings → Database.",
    );
  }

  const ref = projectRef(supabaseUrl);
  const connectionString =
    env.DATABASE_URL ||
    `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

  const sqlPath = resolve(root, "supabase/migrations/0015_kiosk_intake_packets.sql");
  const sql = readFileSync(sqlPath, "utf8");

  console.log(`Connecting to Supabase project ${ref}…`);
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Running 0015_kiosk_intake_packets.sql…");
  await client.query(sql);

  const { rows } = await client.query(
    `select exists (
       select 1 from information_schema.tables
       where table_schema = 'public' and table_name = 'intake_packets'
     ) as ok`,
  );
  await client.end();

  if (!rows[0]?.ok) {
    throw new Error("intake_packets table was not created");
  }
  console.log("Done. intake_packets + form tables + kiosk role are ready.");
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message);
  process.exit(1);
});
