import { redirect } from "next/navigation";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** The consultation is now an intake-style document packet — jump into it. */
export default async function ClinicalCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;

  const supabase = await createClient();
  let isFollowUp = false;
  try {
    const consultation = await getClinicalConsultation(supabase, caseId);
    isFollowUp =
      (consultation as { visit_kind?: string } | null)?.visit_kind === "follow_up";
  } catch {
    // Fall through to the first document either way.
  }

  redirect(`/clinical/cases/${caseId}/docs/${isFollowUp ? "follow-up" : "nofa"}`);
}
