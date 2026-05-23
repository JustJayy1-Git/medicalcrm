"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Deletes patient and linked cases, visits, charges, intake packets (DB cascade). */
export async function deletePatient(patientId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!patientId) redirect("/patients");

  const { error } = await supabase.from("patients").delete().eq("id", patientId);

  if (error) {
    redirect(`/patients/${patientId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/patients");
  revalidatePath("/cases");
  revalidatePath("/intake-packets");
  redirect("/patients?deleted=1");
}

/** Remove abandoned iPad placeholder rows (Intake / Pending …). */
export async function deletePortalPlaceholderPatients(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows, error: listErr } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .eq("first_name", "Intake")
    .like("last_name", "Pending%");

  if (listErr) {
    redirect(`/patients?error=${encodeURIComponent(listErr.message)}`);
  }

  const ids = (rows ?? []).map((r) => r.id);
  if (ids.length > 0) {
    const { error: delErr } = await supabase.from("patients").delete().in("id", ids);
    if (delErr) {
      redirect(`/patients?error=${encodeURIComponent(delErr.message)}`);
    }
  }

  revalidatePath("/patients");
  revalidatePath("/intake-packets");
  redirect(`/patients?cleaned=${ids.length}`);
}
