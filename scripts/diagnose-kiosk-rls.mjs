// Sign in as kiosk, try the actual operations that fail when tapping "start intake".
// Tells us EXACTLY which RLS rule is blocking.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/diagnose-kiosk-rls.mjs <email> <password>");
  process.exit(1);
}

const sb = createClient(url, anonKey, { auth: { persistSession: false } });

console.log("1. Sign in as kiosk...");
const { data: signIn, error: e1 } = await sb.auth.signInWithPassword({ email, password });
if (e1) { console.error("   ❌", e1.message); process.exit(1); }
console.log("   ✅", signIn.user.email);

console.log("2. Read own profile (post-0016 + recursion fix)...");
const { data: profile, error: e2 } = await sb
  .from("profiles").select("id, role, is_active").eq("id", signIn.user.id).single();
if (e2) { console.error("   ❌", e2.message); }
else console.log("   ✅", JSON.stringify(profile));

console.log("3. Insert a patient row (createPortalPacket step 1)...");
const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
const { data: patient, error: e3 } = await sb
  .from("patients")
  .insert({
    first_name: "Intake",
    last_name: `Pending ${stamp}`,
    status: "active",
    created_by: signIn.user.id,
  })
  .select("id")
  .single();
if (e3) { console.error("   ❌ PATIENTS INSERT BLOCKED:", e3.message, "code:", e3.code); }
else console.log("   ✅ patient.id =", patient.id);

if (patient) {
  console.log("4. Insert intake_packet row...");
  const { data: packet, error: e4 } = await sb
    .from("intake_packets")
    .insert({ patient_id: patient.id, status: "in_progress", source: "portal" })
    .select("id")
    .single();
  if (e4) { console.error("   ❌ INTAKE_PACKETS INSERT BLOCKED:", e4.message, "code:", e4.code); }
  else console.log("   ✅ packet.id =", packet.id);

  // Cleanup
  if (packet) await sb.from("intake_packets").delete().eq("id", packet.id);
  await sb.from("patients").delete().eq("id", patient.id);
  console.log("   (cleaned up test rows)");
}
