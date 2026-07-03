import type { ClinicalSection } from "@/lib/clinical/consultation";

/**
 * NP consultation packets.
 *
 * Initial consultation: Initial Evaluation → EMC → No-Fault (NOFA).
 * Follow-up visit: only the Follow-up report.
 */
export const INITIAL_PACKET = ["initial-evaluation", "emc", "nofa"] as const;
export const FOLLOWUP_PACKET = ["follow-up"] as const;

export type ClinicalDocSlug =
  | (typeof INITIAL_PACKET)[number]
  | (typeof FOLLOWUP_PACKET)[number];

export function packetForVisitKind(visitKind: string | null | undefined) {
  return visitKind === "follow_up" ? FOLLOWUP_PACKET : INITIAL_PACKET;
}

export function isClinicalDocSlug(slug: string): slug is ClinicalDocSlug {
  return (
    (INITIAL_PACKET as readonly string[]).includes(slug) ||
    (FOLLOWUP_PACKET as readonly string[]).includes(slug)
  );
}

export const DOC_META: Record<
  ClinicalDocSlug,
  { section: ClinicalSection; shortLabel: string }
> = {
  "initial-evaluation": { section: "initial_report", shortLabel: "Initial Evaluation" },
  emc: { section: "emc", shortLabel: "EMC" },
  nofa: { section: "nofa", shortLabel: "No-Fault" },
  "follow-up": { section: "follow_up", shortLabel: "Follow-up report" },
};

export const SECTION_JSON_KEY: Record<ClinicalSection, string> = {
  nofa: "nofa_json",
  emc: "emc_json",
  initial_report: "initial_report_json",
  follow_up: "followup_json",
};

export const SECTION_COMPLETED_KEY: Record<ClinicalSection, string> = {
  nofa: "nofa_completed_at",
  emc: "emc_completed_at",
  initial_report: "initial_report_completed_at",
  follow_up: "followup_completed_at",
};
