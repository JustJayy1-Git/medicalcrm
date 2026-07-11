import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** New-patient initial consultation E/M code, as on the practice's claims. */
const INITIAL_CONSULT_CPT = "99204";
/** Follow-up NP consultation ($350). Confirm code against the paper HICFA. */
const FOLLOWUP_CONSULT_CPT = "99214";

/**
 * When the NP finishes a consultation packet, bill the consult on a visit
 * for today's date of service — mirroring the practice's manual CMS-1500s:
 * initial packet → 99204, once per case; follow-up note → 99214, once per
 * date of service (a case can have many follow-ups).
 */
export async function createInitialConsultCharge(opts: {
  supabase: SupabaseClient;
  caseId: string;
  createdBy: string;
}): Promise<void> {
  const { supabase, caseId } = opts;

  const { data: consult } = await supabase
    .from("clinical_consultations")
    .select("patient_id, visit_kind")
    .eq("case_id", caseId)
    .maybeSingle();
  if (!consult) return;

  const isFollowUp = consult.visit_kind === "follow_up";
  const cptCode = isFollowUp ? FOLLOWUP_CONSULT_CPT : INITIAL_CONSULT_CPT;

  if (isFollowUp) {
    // Once per date of service.
    const today = new Date().toLocaleDateString("en-CA");
    const { data: todaysVisits } = await supabase
      .from("visits")
      .select("id, charges(cpt_code)")
      .eq("case_id", caseId)
      .eq("visit_date", today);
    const alreadyBilledToday = (todaysVisits ?? []).some((v) =>
      ((v.charges ?? []) as { cpt_code: string | null }[]).some(
        (ch) => ch.cpt_code === FOLLOWUP_CONSULT_CPT,
      ),
    );
    if (alreadyBilledToday) return;
  } else {
    // Once per case.
    const { count } = await supabase
      .from("charges")
      .select("id", { count: "exact", head: true })
      .eq("case_id", caseId)
      .eq("cpt_code", INITIAL_CONSULT_CPT);
    if ((count ?? 0) > 0) return;
  }

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
        visit_type: isFollowUp ? "reeval" : "eval",
        status: "completed",
        notes: isFollowUp
          ? "Follow-up consultation (auto from NP note)"
          : "Initial consultation (auto from NP packet)",
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
    .eq("code", cptCode)
    .maybeSingle();

  const { error } = await supabase.from("charges").insert({
    visit_id: visitId,
    case_id: caseId,
    patient_id: consult.patient_id,
    cpt_code: cptCode,
    units: 1,
    fee: Number(cpt?.default_fee ?? 0),
    modifier: null,
    icd_codes: [] as string[],
    status: "unbilled",
    created_by: opts.createdBy,
  });
  if (error) throw error;
}
