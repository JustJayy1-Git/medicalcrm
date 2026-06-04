import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware will handle the
            // refresh, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Admin client using the SECRET key. Server-side only. Bypasses RLS — handle
 * with care. Use for trusted backend operations (admin tasks, cron, webhooks).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Server misconfigured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for intake saves.",
    );
  }
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
