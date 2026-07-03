import type { ClinicalSection } from "@/lib/clinical/consultation";

/** NP consultation packet — one paper document per page, intake style. */
export const CLINICAL_DOC_ORDER = [
  "nofa",
  "emc",
  "initial-report",
  "follow-up",
] as const;

export type ClinicalDocSlug = (typeof CLINICAL_DOC_ORDER)[number];

export function isClinicalDocSlug(slug: string): slug is ClinicalDocSlug {
  return (CLINICAL_DOC_ORDER as readonly string[]).includes(slug);
}

export const DOC_META: Record<
  ClinicalDocSlug,
  {
    section: ClinicalSection;
    title: string;
    titleEs?: string;
    shortLabel: string;
  }
> = {
  nofa: {
    section: "nofa",
    title: "Florida Motor Vehicle No-Fault Law (PIP) — Notice & Authorization",
    titleEs: "Ley de No Culpa de Florida — Aviso y Autorización",
    shortLabel: "No-Fault",
  },
  emc: {
    section: "emc",
    title: "Emergency Medical Condition (EMC) Determination",
    titleEs: "Determinación de Condición Médica de Emergencia",
    shortLabel: "EMC",
  },
  "initial-report": {
    section: "initial_report",
    title: "Initial Examination Report",
    titleEs: "Informe de Examen Inicial",
    shortLabel: "Initial report",
  },
  "follow-up": {
    section: "follow_up",
    title: "Follow-Up Visit Note",
    titleEs: "Nota de Visita de Seguimiento",
    shortLabel: "Follow-up",
  },
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
