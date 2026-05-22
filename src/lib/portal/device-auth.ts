import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getProfileRole, isKioskRole } from "@/lib/auth-profile";

/** Server-only kiosk device credentials (Vercel env). Patients never type these. */
export function kioskDeviceCredentials() {
  const email = process.env.KIOSK_DEVICE_EMAIL?.trim();
  const password = process.env.KIOSK_DEVICE_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

async function isKioskUser(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  const role = await getProfileRole(supabase, user.id);
  return isKioskRole(role);
}

export async function ensurePortalUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (await isKioskUser(supabase, user)) return user;
    await supabase.auth.signOut();
  }

  return signInKioskDevice(supabase);
}

export async function signInKioskDevice(
  supabase: SupabaseClient,
): Promise<User | null> {
  const creds = kioskDeviceCredentials();
  if (!creds) return null;

  const { error } = await supabase.auth.signInWithPassword(creds);
  if (error) {
    console.error("Kiosk device sign-in failed:", error.message);
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isKioskUser(supabase, user))) {
    await supabase.auth.signOut();
    console.error("Kiosk device credentials are not a kiosk role user");
    return null;
  }

  return user;
}
