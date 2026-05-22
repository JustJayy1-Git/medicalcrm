/**
 * Verify iPad kiosk credentials match Supabase (same check Vercel runs).
 *
 *   node scripts/verify-kiosk.mjs
 *   node scripts/verify-kiosk.mjs --fix          # set role=kiosk + print new password
 *   node scripts/verify-kiosk.mjs user@email.com  # check a specific email
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
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
    vars[key] = val;
  }
  return vars;
}

function env(key, local) {
  return process.env[key] || local[key] || "";
}

const local = loadEnvLocal();
const url = env("NEXT_PUBLIC_SUPABASE_URL", local);
const anonKey = env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", local);
const serviceKey = env("SUPABASE_SECRET_KEY", local);
const args = process.argv.slice(2);
const fix = args.includes("--fix");
const emailArg = args.find((a) => !a.startsWith("--"));
const kioskEmail = (emailArg || env("KIOSK_DEVICE_EMAIL", local)).trim();
const kioskPassword = env("KIOSK_DEVICE_PASSWORD", local);

if (!url || !anonKey || !serviceKey) {
  console.error("Missing Supabase keys in .env.local");
  process.exit(1);
}

if (!kioskEmail) {
  console.error("Set KIOSK_DEVICE_EMAIL in .env.local or pass email as argument.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("=== Kiosk verification ===\n");
console.log(`Email: ${kioskEmail}`);

const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listErr) {
  console.error("Could not list auth users:", listErr.message);
  process.exit(1);
}

const authUser = listData.users.find(
  (u) => u.email?.toLowerCase() === kioskEmail.toLowerCase(),
);

if (!authUser) {
  console.error("\nFAIL: No auth user with this email.");
  console.error("\nFix in Supabase → Authentication → Users → Add user:");
  console.error(`  Email: ${kioskEmail}`);
  console.error("  Auto-confirm email, then run:");
  console.error(`  node scripts/set-kiosk-role.mjs <new-user-uuid>`);
  process.exit(1);
}

console.log(`Auth user: found (${authUser.id})`);
console.log(`Confirmed: ${authUser.email_confirmed_at ? "yes" : "NO — confirm email in Supabase"}`);

const { data: profile, error: profileErr } = await admin
  .from("profiles")
  .select("id, email, role, is_active")
  .eq("id", authUser.id)
  .maybeSingle();

if (profileErr) {
  console.error("\nProfile read error:", profileErr.message);
  if (profileErr.message.includes("profiles_role_check")) {
    console.error("\nMigration 0015 not applied — run: npm run db:migrate-0015");
  }
  process.exit(1);
}

if (!profile) {
  console.error("\nFAIL: Auth user exists but profiles row is missing.");
  if (fix) {
    const { error: upsertErr } = await admin.from("profiles").upsert(
      {
        id: authUser.id,
        email: kioskEmail,
        full_name: "Front Desk iPad",
        role: "kiosk",
        is_active: true,
      },
      { onConflict: "id" },
    );
    if (upsertErr) {
      console.error("Could not create profile:", upsertErr.message);
      process.exit(1);
    }
    console.log("FIXED: Created profile with role=kiosk.");
  } else {
    console.error("Run: node scripts/verify-kiosk.mjs --fix");
    process.exit(1);
  }
} else {
  console.log(`Profile role: ${profile.role ?? "(null)"}`);
  console.log(`Profile active: ${profile.is_active ? "yes" : "no"}`);

  if (profile.role !== "kiosk") {
    console.error(`\nFAIL: role is "${profile.role}", must be "kiosk".`);
    if (fix) {
      const { error: roleErr } = await admin
        .from("profiles")
        .update({ role: "kiosk", is_active: true })
        .eq("id", authUser.id);
      if (roleErr) {
        console.error("Could not set role=kiosk:", roleErr.message);
        if (roleErr.message.includes("profiles_role_check")) {
          console.error("Run migration 0015 first: npm run db:migrate-0015");
        }
        process.exit(1);
      }
      console.log("FIXED: Set role=kiosk.");
    } else {
      console.error("\nFix in Supabase SQL Editor:");
      console.error(
        `  update public.profiles set role = 'kiosk', is_active = true where email = '${kioskEmail}';`,
      );
      console.error("\nOr run: node scripts/verify-kiosk.mjs --fix");
      process.exit(1);
    }
  }
}

let passwordToTest = kioskPassword;

if (fix) {
  passwordToTest = randomBytes(24).toString("base64url");
  const { error: pwErr } = await admin.auth.admin.updateUserById(authUser.id, {
    password: passwordToTest,
  });
  if (pwErr) {
    console.error("Password reset failed:", pwErr.message);
    process.exit(1);
  }
  console.log("\n--- NEW PASSWORD (copy into Vercel KIOSK_DEVICE_PASSWORD) ---");
  console.log(passwordToTest);
  console.log("--- END PASSWORD ---\n");
} else if (!passwordToTest) {
  console.error("\nSKIP password test: KIOSK_DEVICE_PASSWORD not in .env.local");
  console.error("Add it locally or run with --fix to generate a new one.");
  process.exit(1);
}

const anon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: signInData, error: signInErr } = await anon.auth.signInWithPassword({
  email: kioskEmail,
  password: passwordToTest,
});

if (signInErr) {
  console.error("\nFAIL: signInWithPassword:", signInErr.message);
  console.error("\nUsually means KIOSK_DEVICE_PASSWORD in Vercel does not match Supabase.");
  console.error("Run: node scripts/verify-kiosk.mjs --fix");
  console.error("Then paste the new password into Vercel → Environment Variables → Redeploy.");
  process.exit(1);
}

const userId = signInData.user?.id;
const { data: liveProfile, error: liveProfileErr } = await anon
  .from("profiles")
  .select("role")
  .eq("id", userId)
  .maybeSingle();

if (liveProfileErr) {
  console.error("\nFAIL: profile read error:", liveProfileErr.message);
  console.error("\nApply RLS fix: npm run db:migrate-0016");
  process.exit(1);
}

if (liveProfile?.role !== "kiosk") {
  console.error(
    `\nFAIL: Signed in but profile role reads as "${liveProfile?.role ?? "missing"}".`,
  );
  console.error("\nRole is set in DB but kiosk cannot read it — apply RLS fix:");
  console.error("  npm run db:migrate-0016");
  console.error("\nOr paste supabase/migrations/0016_profiles_kiosk_read.sql in Supabase SQL Editor.");
  process.exit(1);
}

console.log("\nOK: Kiosk sign-in works and role=kiosk is readable.");
console.log("\nIf iPad still fails, confirm Vercel has the SAME email + password, then Redeploy.");
