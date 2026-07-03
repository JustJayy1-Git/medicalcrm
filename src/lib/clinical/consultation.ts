import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";

export type ClinicalConsultationStatus = "pending" | "in_progress" | "completed";

export type ClinicalConsultationRow = {
  id: string;
  case_id: string;
  patient_id: string;
  intake_packet_id: number | null;
  status: ClinicalConsultationStatus;
  visit_kind: "initial" | "follow_up";
  nofa_json: Record<string, unknown>;
  emc_json: Record<string, unknown>;
  initial_report_json: Record<string, unknown>;
};

/** Queue row for NP portal home. */
export async function listClinicalQueue(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("clinical_consultations")
    .select(
      `id, status, visit_kind, followup_requested_at, created_at, completed_at,
       case:cases(id, case_number, date_of_injury, description),
       patient:patients(id, first_name, last_name, date_of_birth, phone, email)`,
    )
    .in("status", ["pending", "in_progress"])
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

/** Put a treating patient back in the NP queue as a follow-up visit. */
export async function requestClinicalFollowUp(
  supabase: SupabaseClient,
  caseId: string,
): Promise<void> {
  const { error } = await supabase
    .from("clinical_consultations")
    .update({
      status: "pending",
      visit_kind: "follow_up",
      followup_requested_at: new Date().toISOString(),
    })
    .eq("case_id", caseId);

  if (error) throw error;
}

/** NP finished the follow-up visit — clear it from the queue. */
export async function completeClinicalFollowUp(
  supabase: SupabaseClient,
  caseId: string,
): Promise<void> {
  const { error } = await supabase
    .from("clinical_consultations")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("case_id", caseId);

  if (error) throw error;
}

export async function getClinicalConsultation(
  supabase: SupabaseClient,
  caseId: string,
) {
  const { data, error } = await supabase
    .from("clinical_consultations")
    .select(
      `*,
       case:cases(id, case_number, date_of_injury, description, pain_notes, diagnosis_codes),
       patient:patients(
         id, first_name, last_name, middle_name, date_of_birth, phone, email,
         address_line1, city, state, zip, sex
       )`,
    )
    .eq("case_id", caseId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** After iPad intake finishes, add patient to NP queue. */
export async function ensureClinicalConsultationForCase(opts: {
  caseId: string;
  patientId: string;
  intakePacketId?: number | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("clinical_consultations")
    .select("id")
    .eq("case_id", opts.caseId)
    .maybeSingle();

  if (existing) return;

  const { error } = await admin.from("clinical_consultations").insert({
    case_id: opts.caseId,
    patient_id: opts.patientId,
    intake_packet_id: opts.intakePacketId ?? null,
    status: "pending",
  });

  if (error) throw error;
}

export type ClinicalSection = "nofa" | "emc" | "initial_report" | "follow_up";

const SECTION_COLUMNS: Record<ClinicalSection, { json: string; completed: string }> = {
  nofa: { json: "nofa_json", completed: "nofa_completed_at" },
  emc: { json: "emc_json", completed: "emc_completed_at" },
  initial_report: {
    json: "initial_report_json",
    completed: "initial_report_completed_at",
  },
  follow_up: { json: "followup_json", completed: "followup_completed_at" },
};

export async function saveClinicalFormSection(
  supabase: SupabaseClient,
  caseId: string,
  section: ClinicalSection,
  payload: Record<string, unknown>,
  markComplete: boolean,
): Promise<void> {
  const column = SECTION_COLUMNS[section].json;
  const completedColumn = SECTION_COLUMNS[section].completed;

  const patch: Record<string, unknown> = {
    [column]: payload,
    status: "in_progress",
  };
  if (markComplete) {
    patch[completedColumn] = new Date().toISOString();
  }

  const { error } = await supabase
    .from("clinical_consultations")
    .update(patch)
    .eq("case_id", caseId);

  if (error) throw error;

  if (section === "initial_report") {
    const diagnosis = String(payload.diagnosis ?? "").trim();
    const plan = String(payload.plan ?? "").trim();
    const notes = [diagnosis, plan].filter(Boolean).join("\n\nPlan: ");
    if (notes) {
      await supabase.from("cases").update({ pain_notes: notes }).eq("id", caseId);
    }
    if (diagnosis) {
      await supabase
        .from("cases")
        .update({ diagnosis_codes: diagnosis.slice(0, 500) })
        .eq("id", caseId);
    }
  }

  if (markComplete) {
    const { data: row } = await supabase
      .from("clinical_consultations")
      .select("nofa_completed_at, emc_completed_at, initial_report_completed_at")
      .eq("case_id", caseId)
      .single();

    if (
      row?.nofa_completed_at &&
      row?.emc_completed_at &&
      row?.initial_report_completed_at
    ) {
      await supabase
        .from("clinical_consultations")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("case_id", caseId);
    }
  }
}
