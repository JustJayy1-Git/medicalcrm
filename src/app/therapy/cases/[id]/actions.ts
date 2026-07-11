"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createChargesFromSoapNote } from "@/lib/therapy/billing";
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
    if (key === "case_id" || key === "patient_id" || key.startsWith("_")) return;
    if (typeof value === "string") payload[key] = value;
  });

  await saveTherapyConsent({ supabase, caseId, patientId, payload });

  revalidatePath(`/therapy/cases/${caseId}`);
  revalidatePath("/therapy");

  // Step flow: after the consent is saved, move on to the therapy sheet.
  const nav = String(formData.get("_nav") ?? "");
  if (nav.startsWith("/therapy")) {
    redirect(nav);
  }
}

export async function addTherapySessionAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const caseId = String(formData.get("case_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  const sessionDate = String(formData.get("session_date") ?? "");
  if (!caseId || !patientId || !sessionDate) {
    throw new Error("Invalid therapy session submission");
  }

  // Full SOAP-note payload — proc_* keys carry the CPT codes for billing.
  const payload: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "case_id" || key === "patient_id" || key === "session_date") return;
    if (typeof value === "string") payload[key] = value;
  });

  await addTherapySession({
    supabase,
    caseId,
    patientId,
    sessionDate,
    payload,
    createdBy: user.id,
  });

  // Billing capture: marked procedures become charge lines for this DOS.
  let billingParam = "none";
  try {
    const result = await createChargesFromSoapNote({
      supabase,
      caseId,
      patientId,
      sessionDate,
      payload,
      createdBy: user.id,
    });
    if (result.created > 0) billingParam = `ok-${result.created}`;
    else if (result.skipped > 0) billingParam = "dup";
  } catch (err) {
    // The clinical note is saved either way; billing can be entered manually.
    console.error("SOAP note billing capture failed:", err);
    billingParam = "failed";
  }

  revalidatePath(`/therapy/cases/${caseId}`);
  revalidatePath("/therapy");
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/reports/cms-1500");

  redirect(`/therapy/cases/${caseId}/docs/soap-note?billing=${billingParam}`);
}
