import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type CarePhase =
  | "intake"
  | "doctor_consult"
  | "doctor_followup"
  | "pending_therapist"
  | "in_therapy";

export const CARE_PHASE_META: Record<
  CarePhase,
  { label: string; className: string }
> = {
  intake: {
    label: "Intake",
    className: "bg-vice-surface text-vice-muted border-vice-border",
  },
  doctor_consult: {
    label: "Doctor consult",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  doctor_followup: {
    label: "Doctor follow-up",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  pending_therapist: {
    label: "Pending therapist",
    className: "bg-neon-pink-100 text-neon-pink border-neon-pink-200",
  },
  in_therapy: {
    label: "In therapy",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

/**
 * Where each case sits in the care pipeline, at a glance:
 * intake → doctor consult (or follow-up) → pending therapist → in therapy.
 */
export async function fetchCarePhases(
  supabase: SupabaseClient,
  caseIds: string[],
): Promise<Map<string, CarePhase>> {
  const phases = new Map<string, CarePhase>();
  if (caseIds.length === 0) return phases;

  const [{ data: consults }, { data: sessions }] = await Promise.all([
    supabase
      .from("clinical_consultations")
      .select("case_id, status, visit_kind")
      .in("case_id", caseIds),
    supabase.from("therapy_sessions").select("case_id").in("case_id", caseIds),
  ]);

  const sessionCounts = new Map<string, number>();
  for (const s of sessions ?? []) {
    sessionCounts.set(s.case_id, (sessionCounts.get(s.case_id) ?? 0) + 1);
  }

  const consultByCase = new Map<string, { status: string; visit_kind: string | null }>();
  for (const c of consults ?? []) {
    consultByCase.set(c.case_id, {
      status: c.status,
      visit_kind: (c as { visit_kind?: string | null }).visit_kind ?? null,
    });
  }

  for (const id of caseIds) {
    const consult = consultByCase.get(id);
    const sessionCount = sessionCounts.get(id) ?? 0;

    if (!consult) {
      phases.set(id, "intake");
    } else if (consult.status !== "completed") {
      phases.set(
        id,
        consult.visit_kind === "follow_up" ? "doctor_followup" : "doctor_consult",
      );
    } else if (sessionCount === 0) {
      phases.set(id, "pending_therapist");
    } else {
      phases.set(id, "in_therapy");
    }
  }

  return phases;
}
