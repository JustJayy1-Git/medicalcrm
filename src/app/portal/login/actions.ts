"use server";

import { isKioskRole } from "@/lib/auth-profile";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function safePortalNext(value: string) {
  if (value.startsWith("/portal") && !value.startsWith("//")) return value;
  return "/portal";
}

/** Server-side kiosk sign-in — works on iPad Safari (browser → Supabase fetch often fails). */
export async function portalDeviceSignIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const afterLogin = safePortalNext(String(formData.get("afterLogin") ?? "/portal"));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const loginError = (message: string) => {
    const params = new URLSearchParams({
      next: afterLogin,
      error: message,
    });
    redirect(`/portal/login?${params.toString()}`);
  };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    loginError(error.message);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    loginError("Sign-in failed. Try again.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  if (!isKioskRole(profile?.role)) {
    await supabase.auth.signOut();
    loginError(
      "That account is for staff CRM, not the iPad. Use the kiosk account here, or sign in at /login on a computer.",
    );
  }

  redirect(afterLogin);
}
