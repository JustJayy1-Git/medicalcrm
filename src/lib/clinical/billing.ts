import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** New-patient initial consultation E/M code, as on the practice's claims. */
const INITIAL_CONSULT_CPT = "99204";

/**
 * When the NP finishes the initial consultation packet, bill the initial
 * consult: one 99204 line (units 1, no modifier, fee from the CPT schedule)
 * on a visit for today's date of service — mirroring the practice's manual
 * CMS-1500s. Billed at most once per case.
 */
export async function createInitialConsultCharge(opts: {
  supabase: SupabaseClient;
  caseId: string;
  createdBy: string;
}): Promise<void> {
  const { supabase, caseId } = opts;

  // Only for initial consultations, never follow-ups.
  const { data: consult } = await supabase
    .from("clinical_consultations")
    .select("patient_id, visit_kind")
    .eq("case_id", caseId)
    .maybeSingle();
  if (!consult || consult.visit_kind === "follow_up") return;

  // Once per case.
  const { count } = await supabase
    .from("charges")
    .select("id", { count: "exact", head: true })
    .eq("case_id", caseId)
    .eq("cpt_code", INITIAL_CONSULT_CPT);
  if ((count ?? 0) > 0) return;

  const dos = new Date().toLocaleDateString("en-CA");

  const { data: existingVisit } = await supabase
    .from("visits")
    .select("id")
    .eq("case_id", caseId)
    .eq("visit_date", dos)
    .limit(1)
    .maybeSingle();

  let visitId = existingVisit?.id as string | undefined;
  if (!visitId) {
    const { data: created, error } = await supabase
      .from("visits")
      .insert({
        case_id: caseId,
        patient_id: consult.patient_id,
        visit_date: dos,
        visit_type: "eval",
        status: "completed",
        notes: "Initial consultation (auto from NP packet)",
        created_by: opts.createdBy,
      })
      .select("id")
      .single();
    if (error) throw error;
    visitId = created.id;
  }

  const { data: cpt } = await supabase
    .from("cpt_codes")
    .select("default_fee")
    .eq("code", INITIAL_CONSULT_CPT)
    .maybeSingle();

  const { error } = await supabase.from("charges").insert({
    visit_id: visitId,
    case_id: caseId,
    patient_id: consult.patient_id,
    cpt_code: INITIAL_CONSULT_CPT,
    units: 1,
    fee: Number(cpt?.default_fee ?? 0),
    modifier: null,
    icd_codes: [] as string[],
    status: "unbilled",
    created_by: opts.createdBy,
  });
  if (error) throw error;
}
