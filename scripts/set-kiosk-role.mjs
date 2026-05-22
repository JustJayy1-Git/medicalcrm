// One-shot: mark the kiosk auth user as role='kiosk' in profiles.
// Usage: node scripts/set-kiosk-role.mjs <auth-user-uuid> [email] [full_name]

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load .env.local manually (no dotenv dep)
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

const [, , uid, emailArg, nameArg] = process.argv;
if (!uid) {
  console.error("Usage: node scripts/set-kiosk-role.mjs <auth-user-uuid> [email] [full_name]");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// First, look up the auth user to get email (if not provided)
const { data: userInfo, error: userErr } = await supabase.auth.admin.getUserById(uid);
if (userErr || !userInfo?.user) {
  console.error("Auth user lookup failed:", userErr?.message ?? "not found");
  process.exit(1);
}
const email = emailArg ?? userInfo.user.email ?? "kiosk@local";
const fullName = nameArg ?? "Office iPad";

console.log(`Auth user found: ${userInfo.user.email} (${uid})`);

const { data, error } = await supabase
  .from("profiles")
  .upsert(
    {
      id: uid,
      email,
      full_name: fullName,
      role: "kiosk",
      is_active: true,
    },
    { onConflict: "id" }
  )
  .select()
  .single();

if (error) {
  console.error("Upsert failed:", error.message);
  process.exit(1);
}

console.log("Profile updated:");
console.log(JSON.stringify(data, null, 2));
