/**
 * Set role=kiosk on a user by email (no UUID needed).
 *
 *   node scripts/set-kiosk-by-email.mjs kiosk@proinjury.local
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

if (!existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const key = t.slice(0, i).trim();
  let val = t.slice(i + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

const email = process.argv[2]?.trim();
if (!email) {
  console.error("Usage: node scripts/set-kiosk-by-email.mjs <kiosk-email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listErr) {
  console.error("Could not list users:", listErr.message);
  process.exit(1);
}

const authUser = listData.users.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);
if (!authUser) {
  console.error(`No auth user found with email: ${email}`);
  process.exit(1);
}

console.log(`Auth user: ${authUser.email}`);
console.log(`UID: ${authUser.id}`);

const { data, error } = await admin
  .from("profiles")
  .upsert(
    {
      id: authUser.id,
      email: authUser.email ?? email,
      full_name: "Front Desk iPad",
      role: "kiosk",
      is_active: true,
    },
    { onConflict: "id" },
  )
  .select("id, email, role, is_active")
  .single();

if (error) {
  console.error("Failed to set role=kiosk:", error.message);
  if (error.message.includes("profiles_role_check")) {
    console.error("\nMigration 0015 is missing. Run in Supabase SQL Editor:");
    console.error("  supabase/migrations/0015_kiosk_role.sql");
    console.error("Or: npm run db:migrate-0015");
  }
  process.exit(1);
}

console.log("\nProfile updated:");
console.log(JSON.stringify(data, null, 2));
console.log("\nOK — role is kiosk. Redeploy Vercel only if you changed env vars.");
