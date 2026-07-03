import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Common therapy services shown as checkboxes on the session sheet. */
export const THERAPY_SERVICES = [
  { code: "97124", label: "Massage therapy" },
  { code: "97140", label: "Manual therapy" },
  { code: "97110", label: "Therapeutic exercises" },
  { code: "97010", label: "Hot / cold packs" },
  { code: "97012", label: "Mechanical traction" },
  { code: "97014", label: "Electrical stimulation" },
] as const;

/**
 * Therapist home queue: open/active cases with patient, consent state, and
 * NP consultation status so the therapist knows who is ready for therapy.
 */
export async function listTherapyQueue(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("cases")
    .select(
      `id, case_number, date_of_injury, status, updated_at,
       patient:patients(id, first_name, last_name, date_of_birth, phone),
       consultation:clinical_consultations(status, completed_at),
       consent:therapy_consents(id, signed_at)`,
    )
    .in("status", ["open", "active"])
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function getTherapyCase(supabase: SupabaseClient, caseId: string) {
  const { data, error } = await supabase
    .from("cases")
    .select(
      `id, case_number, date_of_injury, description, status,
       patient:patients(id, first_name, last_name, date_of_birth, phone, email),
       consultation:clinical_consultations(status, completed_at),
       consent:therapy_consents(id, consent_json, signed_at)`,
    )
    .eq("id", caseId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listTherapySessions(
  supabase: SupabaseClient,
  caseId: string,
) {
  const { data, error } = await supabase
    .from("therapy_sessions")
    .select("id, session_date, session_json, created_at")
    .eq("case_id", caseId)
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return data ?? [];
}

export async function saveTherapyConsent(opts: {
  supabase: SupabaseClient;
  caseId: string;
  patientId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const signed = Boolean(
    typeof opts.payload.patient_signature === "string" &&
      (opts.payload.patient_signature as string).startsWith("data:image"),
  );

  const { error } = await opts.supabase.from("therapy_consents").upsert(
    {
      case_id: opts.caseId,
      patient_id: opts.patientId,
      consent_json: opts.payload,
      signed_at: signed ? new Date().toISOString() : null,
    },
    { onConflict: "case_id" },
  );

  if (error) throw error;
}

export async function addTherapySession(opts: {
  supabase: SupabaseClient;
  caseId: string;
  patientId: string;
  sessionDate: string;
  payload: Record<string, unknown>;
  createdBy: string;
}): Promise<void> {
  const { error } = await opts.supabase.from("therapy_sessions").insert({
    case_id: opts.caseId,
    patient_id: opts.patientId,
    session_date: opts.sessionDate,
    session_json: opts.payload,
    created_by: opts.createdBy,
  });

  if (error) throw error;
}
