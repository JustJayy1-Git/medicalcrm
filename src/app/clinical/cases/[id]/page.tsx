import { redirect } from "next/navigation";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import { packetForVisitKind } from "@/lib/clinical/doc-slugs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** The consultation is an intake-style document packet — jump into it. */
export default async function ClinicalCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;

  const supabase = await createClient();
  let visitKind: string | undefined;
  try {
    const consultation = await getClinicalConsultation(supabase, caseId);
    visitKind = (consultation as { visit_kind?: string } | null)?.visit_kind;
  } catch {
    // Fall through to the first document either way.
  }

  redirect(`/clinical/cases/${caseId}/docs/${packetForVisitKind(visitKind)[0]}`);
}
