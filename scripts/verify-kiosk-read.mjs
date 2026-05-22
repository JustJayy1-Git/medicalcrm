// Verify the kiosk user can sign in AND read its own profile row (post-0016).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/verify-kiosk-read.mjs <kiosk-email> <kiosk-password>");
  process.exit(1);
}

const sb = createClient(url, anonKey, { auth: { persistSession: false } });

console.log("1. Signing in as kiosk user...");
const { data: signIn, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
if (signInErr) {
  console.error("   ❌ Sign-in failed:", signInErr.message);
  process.exit(1);
}
console.log(`   ✅ Signed in as ${signIn.user.email}`);

console.log("2. Reading own profile row...");
const { data: profile, error: profileErr } = await sb
  .from("profiles")
  .select("id, email, role, is_active, full_name")
  .eq("id", signIn.user.id)
  .single();

if (profileErr) {
  console.error("   ❌ Profile read failed:", profileErr.message);
  process.exit(1);
}
console.log("   ✅ Profile read OK:");
console.log("  ", JSON.stringify(profile));

console.log("");
console.log("🎯 Kiosk auth + profile read both working.");
