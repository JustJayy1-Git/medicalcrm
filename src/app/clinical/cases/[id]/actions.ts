"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveClinicalFormSection } from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";

export async function saveClinicalDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseId = String(formData.get("case_id") ?? "");
  const section = String(formData.get("section") ?? "") as
    | "nofa"
    | "emc"
    | "initial_report";
  if (!caseId || !["nofa", "emc", "initial_report"].includes(section)) {
    throw new Error("Invalid clinical form submission");
  }

  const payload: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "case_id" || key === "section" || key === "_complete") return;
    if (typeof value === "string") payload[key] = value;
  });

  const markComplete = formData.get("_complete") === "1";

  await saveClinicalFormSection(supabase, caseId, section, payload, markComplete);

  revalidatePath(`/clinical/cases/${caseId}`);
  revalidatePath("/clinical");
}
