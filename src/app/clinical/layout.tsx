import { headers } from "next/headers";
import { ClinicalShell } from "@/components/clinical/clinical-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ClinicalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/clinical");

  // Printable pages render bare (no sidebar chrome on paper).
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.includes("/print")) return <>{children}</>;

  return <ClinicalShell userEmail={user.email}>{children}</ClinicalShell>;
}
