"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addTherapySession, saveTherapyConsent } from "@/lib/therapy/therapy";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/therapy");
  return { supabase, user };
}

export async function saveTherapyConsentAction(formData: FormData) {
  const { supabase } = await requireUser();

  const caseId = String(formData.get("case_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  if (!caseId || !patientId) throw new Error("Invalid consent submission");

  const payload: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "case_id" || key === "patient_id") return;
    if (typeof value === "string") payload[key] = value;
  });

  await saveTherapyConsent({ supabase, caseId, patientId, payload });

  revalidatePath(`/therapy/cases/${caseId}`);
  revalidatePath("/therapy");
}

export async function addTherapySessionAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const caseId = String(formData.get("case_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const sessionDate = String(formData.get("session_date") ?? "");
  if (!caseId || !patientId || !sessionDate) {
    throw new Error("Invalid therapy session submission");
  }

  const payload: Record<string, unknown> = {};
  const services: string[] = [];
  formData.forEach((value, key) => {
    if (key === "case_id" || key === "patient_id" || key === "session_date") return;
    if (key === "services") {
      if (typeof value === "string") services.push(value);
      return;
    }
    if (typeof value === "string") payload[key] = value;
  });
  payload.services = services;

  await addTherapySession({
    supabase,
    caseId,
    patientId,
    sessionDate,
    payload,
    createdBy: user.id,
  });

  revalidatePath(`/therapy/cases/${caseId}`);
  revalidatePath("/therapy");
}
