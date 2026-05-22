import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensurePortalUser } from "@/lib/portal/device-auth";

/** Server routes/actions for the iPad portal — always uses the kiosk device session. */
export async function createPortalClient() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Middleware will refresh on the next navigation.
          }
        },
      },
    },
  );

  const user = await ensurePortalUser(supabase);
  return { supabase, user };
}
