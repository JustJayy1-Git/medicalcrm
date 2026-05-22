// Reset the kiosk user's password to a fresh random one, then verify sign-in + profile read.
// Usage: node scripts/reset-and-verify-kiosk.mjs <auth-user-uuid>

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const [, , uid] = process.argv;
if (!uid) {
  console.error("Usage: node scripts/reset-and-verify-kiosk.mjs <auth-user-uuid>");
  process.exit(1);
}

const newPassword = randomBytes(24).toString("base64url");
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

console.log("1. Resetting kiosk password...");
const { data: resetData, error: resetErr } = await admin.auth.admin.updateUserById(uid, {
  password: newPassword,
});
if (resetErr) {
  console.error("   ❌ Reset failed:", resetErr.message);
  process.exit(1);
}
console.log(`   ✅ Password reset for ${resetData.user.email}`);

// Tiny delay to make sure auth propagates
await new Promise(r => setTimeout(r, 1000));

console.log("2. Signing in with the new password...");
const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
  email: resetData.user.email,
  password: newPassword,
});
if (signInErr) {
  console.error("   ❌ Sign-in failed:", signInErr.message);
  process.exit(1);
}
console.log(`   ✅ Signed in: ${signIn.user.email}`);

console.log("3. Reading own profile row...");
const { data: profile, error: profileErr } = await anon
  .from("profiles")
  .select("id, email, role, is_active, full_name")
  .eq("id", signIn.user.id)
  .single();
if (profileErr) {
  console.error("   ❌ Profile read failed:", profileErr.message);
  process.exit(1);
}
console.log("   ✅ Profile:", JSON.stringify(profile));

console.log("");
console.log("=".repeat(60));
console.log("🎯 EVERYTHING WORKS. Copy this NEW password into Vercel:");
console.log("=".repeat(60));
console.log("");
console.log(newPassword);
console.log("");
console.log("=".repeat(60));
console.log("Then redeploy. After that, /portal will work on the iPad.");
console.log("=".repeat(60));
