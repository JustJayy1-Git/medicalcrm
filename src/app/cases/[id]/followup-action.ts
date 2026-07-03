"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requestClinicalFollowUp } from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";

/** Staff or therapist sends a treating patient back to the NP queue. */
export async function sendCaseToNpFollowUp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseId = String(formData.get("case_id") ?? "");
  if (!caseId) throw new Error("Missing case id");

  await requestClinicalFollowUp(supabase, caseId);

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/clinical");
  revalidatePath(`/therapy/cases/${caseId}`);
}
