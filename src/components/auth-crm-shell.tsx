import { headers } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { isCrmShellPath } from "@/lib/crm-routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Persistent CRM chrome for authenticated app routes.
 * Auth is enforced in proxy; this only loads user for the shell.
 */
export async function AuthCrmShell({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (!isCrmShellPath(pathname)) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
