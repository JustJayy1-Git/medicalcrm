/**
 * Quick health check — run: node scripts/check-supabase.mjs
 * Does not print secret values.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return { path, vars: {} };
  const text = readFileSync(path, "utf8");
  const vars = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return { path, vars };
}

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
];

const OPTIONAL_DB = [
  "DATABASE_URL",
  "SUPABASE_DB_PASSWORD",
  "POSTGRES_PASSWORD",
];

async function main() {
  const { path: envPath, vars } = loadEnvLocal();
  const lines = [];

  lines.push("=== MedicalCRM Supabase check ===\n");
  lines.push(`.env.local: ${existsSync(envPath) ? envPath : "NOT FOUND"}\n`);

  for (const key of REQUIRED) {
    const v = vars[key] || process.env[key];
    const ok = Boolean(v && v.length > 5);
    lines.push(`${ok ? "OK" : "MISSING"}  ${key}`);
  }

  lines.push("\n(Optional — only for Supabase CLI / psql, NOT required for the app):");
  for (const key of OPTIONAL_DB) {
    const v = vars[key] || process.env[key];
    if (v) lines.push(`SET    ${key}`);
  }

  const url = vars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    vars.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    lines.push("\nCannot test API — fix missing keys above.");
    console.log(lines.join("\n"));
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { count: carrierCount, error: countErr } = await admin
    .from("insurance_carriers")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    lines.push(`\nAPI error (carriers table): ${countErr.message}`);
  } else {
    lines.push(`\nCarriers in DB: ${carrierCount ?? 0}`);
  }

  const { data: sample, error: colErr } = await admin
    .from("insurance_carriers")
    .select("id, name, seed_key, sort_rank")
    .limit(3);

  if (colErr) {
    if (
      colErr.message.includes("seed_key") ||
      colErr.message.includes("sort_rank")
    ) {
      lines.push(
        "\nMigration 0012 NOT applied yet — columns seed_key / sort_rank missing.",
      );
      lines.push("Fix: run supabase/migrations/0012_fl_common_carriers.sql in SQL Editor.");
    } else {
      lines.push(`\nColumn probe error: ${colErr.message}`);
    }
  } else {
    const seeded = sample?.filter((r) => r.seed_key)?.length ?? 0;
    lines.push(
      `\nMigration 0012 columns: OK (sample rows with seed_key: ${seeded}/${sample?.length ?? 0})`,
    );
    if (sample?.length) {
      lines.push("Sample: " + sample.map((r) => r.name).join(", "));
    }
  }

  const { error: authErr } = await admin.auth.getUser(
    "00000000-0000-0000-0000-000000000000",
  );
  if (authErr && authErr.message.includes("Invalid API key")) {
    lines.push("\nWARNING: Secret key rejected — check SUPABASE_SECRET_KEY in .env.local");
  } else {
    lines.push("\nSecret key: accepted by Supabase API");
  }

  console.log(lines.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
