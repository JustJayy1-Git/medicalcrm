// One-shot: reset the kiosk auth user's password to a fresh strong random one.
// Usage: node scripts/reset-kiosk-password.mjs <auth-user-uuid>
// Prints the new password ONCE. Copy it immediately into Vercel.

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
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const [, , uid] = process.argv;
if (!uid) {
  console.error("Usage: node scripts/reset-kiosk-password.mjs <auth-user-uuid>");
  process.exit(1);
}

// Generate strong random password: 32 url-safe chars
const newPassword = randomBytes(24).toString("base64url");

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.updateUserById(uid, {
  password: newPassword,
});

if (error) {
  console.error("Password reset failed:", error.message);
  process.exit(1);
}

console.log("=".repeat(60));
console.log("PASSWORD RESET SUCCESS");
console.log("=".repeat(60));
console.log(`User: ${data.user.email}`);
console.log(`UID:  ${data.user.id}`);
console.log("");
console.log("NEW PASSWORD (copy this NOW into Vercel KIOSK_DEVICE_PASSWORD):");
console.log("");
console.log(newPassword);
console.log("");
console.log("=".repeat(60));
console.log("This will not be shown again. Save it before continuing.");
console.log("=".repeat(60));
