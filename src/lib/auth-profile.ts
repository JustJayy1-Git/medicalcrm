import type { SupabaseClient } from "@supabase/supabase-js";

export type StaffRole =
  | "admin"
  | "manager"
  | "staff"
  | "billing"
  | "readonly"
  | "kiosk";

export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<StaffRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return (data?.role as StaffRole) ?? null;
}

export function isKioskRole(role: string | null) {
  return role === "kiosk";
}
