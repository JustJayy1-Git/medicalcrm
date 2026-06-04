import { ClinicalShell } from "@/components/clinical/clinical-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ClinicalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/clinical");

  return <ClinicalShell userEmail={user.email}>{children}</ClinicalShell>;
}
