"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  completeClinicalFollowUp,
  saveClinicalFormSection,
  type ClinicalSection,
} from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";

const SECTIONS: ClinicalSection[] = ["nofa", "emc", "initial_report", "follow_up"];

export async function saveClinicalDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseId = String(formData.get("case_id") ?? "");
  const section = String(formData.get("section") ?? "") as ClinicalSection;
  if (!caseId || !SECTIONS.includes(section)) {
    throw new Error("Invalid clinical form submission");
  }

  const payload: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "case_id" || key === "section" || key.startsWith("_")) return;
    if (typeof value === "string") payload[key] = value;
  });

  // "_finish" (toolbar on the last document) both completes and navigates.
  const finishNav = String(formData.get("_finish") ?? "");
  const markComplete = formData.get("_complete") === "1" || Boolean(finishNav);

  await saveClinicalFormSection(supabase, caseId, section, payload, markComplete);

  // Finishing the packet (toolbar on the last document) closes the whole
  // consultation — the patient leaves the NP queue and moves to therapy.
  // Completing the follow-up note does the same for follow-up visits.
  if (finishNav || (section === "follow_up" && markComplete)) {
    await completeClinicalFollowUp(supabase, caseId);
  }

  revalidatePath(`/clinical/cases/${caseId}`);
  revalidatePath("/clinical");

  const nav = String(formData.get("_nav") ?? "") || finishNav;
  if (nav.startsWith("/clinical")) {
    redirect(nav);
  }
}

export async function completeFollowUpAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseId = String(formData.get("case_id") ?? "");
  if (!caseId) throw new Error("Invalid follow-up submission");

  await completeClinicalFollowUp(supabase, caseId);

  revalidatePath(`/clinical/cases/${caseId}`);
  revalidatePath("/clinical");
}
