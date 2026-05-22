"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  buildPatientPayloadFromForm,
  insertPatientFromPayload,
} from "@/lib/patient-intake-payload";

export async function createPatient(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = buildPatientPayloadFromForm(formData, user.id);
  const result = await insertPatientFromPayload(supabase, payload);

  if (result.error === "missing_name") {
    redirect("/patients/new?error=missing_name");
  }
  if (typeof result.error === "string") {
    redirect(`/patients/new?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/patients");
  redirect(`/patients/${result.id}`);
}
