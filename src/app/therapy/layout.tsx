import { TherapyShell } from "@/components/therapy/therapy-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TherapyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/therapy");

  return <TherapyShell userEmail={user.email}>{children}</TherapyShell>;
}
