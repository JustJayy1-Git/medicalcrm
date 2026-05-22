/**
 * Apply migration 0012 using SUPABASE_DB_PASSWORD from .env.local
 * Run from project root: npm run db:migrate-0012
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
      "SUPABASE_DB_PASSWORD missing in .env.local — use the database password from Supabase → Settings → Database (not the API secret key).",
    );
  }

  const ref = projectRef(supabaseUrl);
  const connectionString =
    env.DATABASE_URL ||
    `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

  const sqlPath = resolve(
    root,
    "supabase/migrations/0012_fl_common_carriers.sql",
  );
  const sql = readFileSync(sqlPath, "utf8");

  console.log(`Connecting to Supabase project ${ref}…`);
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Running 0012_fl_common_carriers.sql…");
  await client.query(sql);

  const { rows } = await client.query(
    `select count(*)::int as total,
            count(*) filter (where seed_key is not null)::int as fl_common
     from public.insurance_carriers`,
  );
  await client.end();

  const { total, fl_common } = rows[0];
  console.log(`Done. Carriers: ${total} total, ${fl_common} FL common (seeded).`);
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message);
  if (err.message.includes("password authentication failed")) {
    console.error(
      "\nThe database password is wrong. In Supabase Dashboard → Settings → Database,\nreset the password and update SUPABASE_DB_PASSWORD in .env.local.",
    );
  }
  process.exit(1);
});
