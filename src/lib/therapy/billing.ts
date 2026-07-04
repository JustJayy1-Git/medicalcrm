import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { sessionProcedureLines } from "@/lib/therapy/therapy";

/**
 * Turn a saved Therapy SOAP Note into billable charge lines, exactly like
 * the practice's manual flow: one visit per case per date, one charge per
 * marked CPT code with the modality units, per-unit fee from the CPT fee
 * schedule, and modifier 59 (as on the practice's CMS-1500s).
 *
 * Codes already charged on that visit are skipped, so re-saving a note or
 * saving a second note the same day never double-bills.
 */
export async function createChargesFromSoapNote(opts: {
  supabase: SupabaseClient;
  caseId: string;
  patientId: string;
  sessionDate: string;
  payload: Record<string, unknown>;
  createdBy: string;
}): Promise<{ created: number; skipped: number; zeroFee: string[] }> {
  const { supabase } = opts;
  const lines = sessionProcedureLines(opts.payload);
  if (lines.length === 0) return { created: 0, skipped: 0, zeroFee: [] };

  // Find or create the visit for this date of service.
  const { data: existingVisit } = await supabase
    .from("visits")
    .select("id")
    .eq("case_id", opts.caseId)
    .eq("visit_date", opts.sessionDate)
    .limit(1)
    .maybeSingle();

  let visitId = existingVisit?.id as string | undefined;
  if (!visitId) {
    const { data: created, error } = await supabase
      .from("visits")
      .insert({
        case_id: opts.caseId,
        patient_id: opts.patientId,
        visit_date: opts.sessionDate,
        visit_type: "office",
        status: "completed",
        notes: "Therapy session (auto from SOAP note)",
        created_by: opts.createdBy,
      })
      .select("id")
      .single();
    if (error) throw error;
    visitId = created.id;
  }

  // Skip codes already billed on this visit (idempotent re-saves).
  const { data: existingCharges } = await supabase
    .from("charges")
    .select("cpt_code")
    .eq("visit_id", visitId);
  const alreadyBilled = new Set(
    (existingCharges ?? []).map((c) => c.cpt_code as string),
  );

  const newLines = lines.filter((l) => !alreadyBilled.has(l.code));
  const skipped = lines.length - newLines.length;
  if (newLines.length === 0) return { created: 0, skipped, zeroFee: [] };

  // Per-unit fees from the CPT fee schedule.
  const { data: cptRows } = await supabase
    .from("cpt_codes")
    .select("code, default_fee")
    .in(
      "code",
      newLines.map((l) => l.code),
    );
  const feeByCode = new Map(
    (cptRows ?? []).map((r) => [r.code as string, Number(r.default_fee ?? 0)]),
  );

  const zeroFee: string[] = [];
  const rows = newLines.map((l) => {
    const fee = feeByCode.get(l.code) ?? 0;
    if (!(fee > 0)) zeroFee.push(l.code);
    return {
      visit_id: visitId,
      case_id: opts.caseId,
      patient_id: opts.patientId,
      cpt_code: l.code,
      units: l.units,
      fee,
      modifier: "59",
      icd_codes: [] as string[],
      status: "unbilled",
      created_by: opts.createdBy,
    };
  });

  const { error: chargeErr } = await supabase.from("charges").insert(rows);
  if (chargeErr) throw chargeErr;

  return { created: rows.length, skipped, zeroFee };
}
