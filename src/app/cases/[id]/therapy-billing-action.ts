"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rebuildTherapyBillingForCase } from "@/lib/therapy/billing";
import { createClient } from "@/lib/supabase/server";

/**
 * Backfill charges from every saved therapy SOAP note on the case.
 * Idempotent — already-billed codes are skipped.
 */
export async function syncTherapyBilling(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseId = String(formData.get("case_id") ?? "");
  if (!caseId) throw new Error("Missing case id");

  let result = { sessions: 0, created: 0 };
  let failed = false;
  try {
    result = await rebuildTherapyBillingForCase({
      supabase,
      caseId,
      createdBy: user.id,
    });
  } catch (err) {
    console.error("syncTherapyBilling:", err);
    failed = true;
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/reports/cms-1500");

  const param = failed
    ? "failed"
    : `${result.created}-of-${result.sessions}`;
  redirect(`/cases/${caseId}?billing_sync=${param}`);
}
