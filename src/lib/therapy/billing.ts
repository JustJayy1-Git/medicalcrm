import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SOAP_PROCEDURE_LABELS,
  sessionProcedureLines,
} from "@/lib/therapy/therapy";

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

  // charges.cpt_code has a FK to cpt_codes — register any SOAP-sheet code
  // that is missing from the fee schedule (fee 0.00 until priced) so one
  // unknown code can never sink the whole day's billing.
  const missing = newLines.filter((l) => !feeByCode.has(l.code));
  if (missing.length > 0) {
    const { error: seedErr } = await supabase.from("cpt_codes").upsert(
      missing.map((l) => ({
        code: l.code,
        description: SOAP_PROCEDURE_LABELS.get(l.code) ?? `Therapy procedure ${l.code}`,
        default_fee: 0,
        is_active: true,
        category: "therapy",
      })),
      { onConflict: "code", ignoreDuplicates: true },
    );
    if (seedErr) throw seedErr;
    for (const l of missing) feeByCode.set(l.code, 0);
  }

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

/**
 * Backfill: re-run billing capture for every saved SOAP note on a case.
 * Idempotent — codes already charged on a visit are skipped, so this only
 * fills the gaps left by earlier failed captures.
 */
export async function rebuildTherapyBillingForCase(opts: {
  supabase: SupabaseClient;
  caseId: string;
  createdBy: string;
}): Promise<{ sessions: number; created: number }> {
  const { data: sessions, error } = await opts.supabase
    .from("therapy_sessions")
    .select("patient_id, session_date, session_json")
    .eq("case_id", opts.caseId)
    .order("session_date", { ascending: true });
  if (error) throw error;

  let created = 0;
  for (const s of sessions ?? []) {
    const result = await createChargesFromSoapNote({
      supabase: opts.supabase,
      caseId: opts.caseId,
      patientId: s.patient_id as string,
      sessionDate: s.session_date as string,
      payload: (s.session_json ?? {}) as Record<string, unknown>,
      createdBy: opts.createdBy,
    });
    created += result.created;
  }
  return { sessions: (sessions ?? []).length, created };
}
