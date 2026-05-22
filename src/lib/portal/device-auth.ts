import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getProfileRole, isKioskRole } from "@/lib/auth-profile";

/** Server-only kiosk device credentials (Vercel env). Patients never type these. */
export function kioskDeviceCredentials() {
  const email = process.env.KIOSK_DEVICE_EMAIL?.trim();
  const password = process.env.KIOSK_DEVICE_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export type KioskSignInFailure =
  | "missing_credentials"
  | "invalid_credentials"
  | "not_kiosk_role"
  | "profile_missing";

export type KioskSignInResult =
  | { ok: true; user: User }
  | { ok: false; reason: KioskSignInFailure };

async function isKioskUser(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  const role = await getProfileRole(supabase, user.id);
  return isKioskRole(role);
}

export function kioskSignInErrorMessage(reason: KioskSignInFailure): string {
  switch (reason) {
    case "missing_credentials":
      return "Kiosk not configured. Add KIOSK_DEVICE_EMAIL and KIOSK_DEVICE_PASSWORD in Vercel, then redeploy.";
    case "invalid_credentials":
      return "Kiosk password is wrong in Vercel. Reset the kiosk password in Supabase, update KIOSK_DEVICE_PASSWORD in Vercel, then redeploy.";
    case "profile_missing":
      return "Kiosk user exists but has no profile row. In Supabase, run: update public.profiles set role = 'kiosk', is_active = true where email = your kiosk email.";
    case "not_kiosk_role":
      return "Kiosk user exists but role is not kiosk. In Supabase SQL: update public.profiles set role = 'kiosk', is_active = true where email = your kiosk email.";
  }
}

export async function signInKioskDeviceDetailed(
  supabase: SupabaseClient,
): Promise<KioskSignInResult> {
  const creds = kioskDeviceCredentials();
  if (!creds) return { ok: false, reason: "missing_credentials" };

  const { error } = await supabase.auth.signInWithPassword(creds);
  if (error) {
    console.error("Kiosk device sign-in failed:", error.message);
    return { ok: false, reason: "invalid_credentials" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    await supabase.auth.signOut();
    return { ok: false, reason: "invalid_credentials" };
  }

  const role = await getProfileRole(supabase, user.id);
  if (role === null) {
    await supabase.auth.signOut();
    console.error("Kiosk user has no profiles row");
    return { ok: false, reason: "profile_missing" };
  }

  if (!isKioskRole(role)) {
    await supabase.auth.signOut();
    console.error(`Kiosk device user has role "${role}", expected kiosk`);
    return { ok: false, reason: "not_kiosk_role" };
  }

  return { ok: true, user };
}

export async function signInKioskDevice(
  supabase: SupabaseClient,
): Promise<User | null> {
  const result = await signInKioskDeviceDetailed(supabase);
  return result.ok ? result.user : null;
}

export async function ensurePortalUser(
  supabase: SupabaseClient,
): Promise<{ user: User | null; kioskFailure?: KioskSignInFailure }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (await isKioskUser(supabase, user)) return { user };
    await supabase.auth.signOut();
  }

  const result = await signInKioskDeviceDetailed(supabase);
  if (result.ok) return { user: result.user };
  return { user: null, kioskFailure: result.reason };
}
