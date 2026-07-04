import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { loadForm } from "@/lib/intake-packet/form-persistence";

type CaseFields = {
  date_of_injury?: string | null;
  case_type?: string | null;
  how_it_happened?: string | null;
  loss_consciousness?: boolean | null;
  airbag_deployed?: boolean | null;
  seatbelt_worn?: boolean | null;
  er_visit?: boolean | null;
};

type PatientFields = {
  date_of_birth?: string | null;
  sex?: string | null;
};

function ageFromDob(dob: string): string {
  const birth = new Date(`${dob}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 130 ? String(age) : "";
}

/**
 * Defaults for a fresh Initial Evaluation, derived from the patient chart,
 * the case (synced from iPad intake), and the intake form itself — so the
 * NP never re-enters what the patient already answered. Only used when the
 * evaluation has no saved data yet; saved answers always win.
 */
export async function buildInitialEvalPrefill(opts: {
  supabase: SupabaseClient;
  patientName: string;
  patient: PatientFields | null;
  caseRow: CaseFields | null;
  intakePacketId: number | null;
}): Promise<Record<string, string>> {
  const { patient, caseRow } = opts;
  const p: Record<string, string> = {};

  p.patient_name = opts.patientName;

  if (caseRow?.date_of_injury) p.accident_date = caseRow.date_of_injury;
  if (patient?.date_of_birth) {
    p.dob = patient.date_of_birth;
    p.age = ageFromDob(patient.date_of_birth);
  }

  // Intake form answers (driver/passenger, hospital, gender fallback).
  let intake: Record<string, unknown> = {};
  if (opts.intakePacketId != null) {
    try {
      intake = await loadForm(opts.supabase, opts.intakePacketId, "intake");
    } catch (err) {
      console.error("initial-eval prefill: intake load failed", err);
    }
  }

  const sex = (patient?.sex ?? "").toUpperCase();
  const gender = String(intake.gender ?? "").toLowerCase();
  if (sex === "F" || gender === "female") p.sex_f = "1";
  else if (sex === "M" || gender === "male") p.sex_m = "1";

  if (caseRow?.case_type === "mva") p.case_accident = "1";
  else if (caseRow?.case_type === "slip_fall") p.case_slip_fall = "1";

  const role = String(intake.client_role ?? "").toLowerCase();
  if (role === "driver") p.pos_driver = "1";
  else if (role === "passenger") p.pos_front = "1";

  if (caseRow?.loss_consciousness === true) p.unconscious = "1";
  else if (caseRow?.loss_consciousness === false) p.conscious = "1";

  if (caseRow?.seatbelt_worn === true) p.seatbelt_yes = "1";
  else if (caseRow?.seatbelt_worn === false) p.seatbelt_no = "1";

  if (caseRow?.airbag_deployed === true) p.airbag_yes = "1";
  else if (caseRow?.airbag_deployed === false) p.airbag_no = "1";

  const hospital = String(intake.hospital ?? "").toLowerCase();
  if (caseRow?.er_visit === true || hospital === "yes") p.hospital_yes = "1";
  else if (caseRow?.er_visit === false || hospital === "no") p.hospital_no = "1";

  const how =
    caseRow?.how_it_happened?.trim() || String(intake.acc_summary ?? "").trim();
  if (how) p.how_happened = how;

  return p;
}

/** Prefill applies only before the NP's first save. */
export function isUnstarted(saved: Record<string, unknown>): boolean {
  return Object.keys(saved).length === 0;
}
