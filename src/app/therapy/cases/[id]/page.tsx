import { redirect } from "next/navigation";
import { getTherapyCase } from "@/lib/therapy/therapy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Step flow: consent first (once), then the daily therapy sheet.
 * Opening a patient lands on whichever step is next.
 */
export default async function TherapyCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;

  const supabase = await createClient();
  let consentSigned = false;
  try {
    const caseRow = await getTherapyCase(supabase, caseId);
    const consent = Array.isArray(caseRow?.consent)
      ? caseRow?.consent[0]
      : caseRow?.consent;
    consentSigned = Boolean(consent?.signed_at);
  } catch {
    // Fall through to consent — the doc page 404s if the case is missing.
  }

  redirect(`/therapy/cases/${caseId}/docs/${consentSigned ? "soap-note" : "consent"}`);
}
