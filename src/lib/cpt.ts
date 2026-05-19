/** Reference helpers for CPT codes and MultiLink templates. */

export const CPT_PICKER_SELECT =
  "code, description, category, default_fee, is_active" as const;

export type CptCode = {
  code: string;
  description: string;
  category: string | null;
  default_fee: number;
  is_active: boolean;
};

export const MULTILINK_TEMPLATE_SELECT =
  "id, slug, name, description, visit_type, sort_rank, is_active" as const;

export type MultilinkTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  visit_type: string;
  sort_rank: number;
  is_active: boolean;
};

export type MultilinkTemplateLine = {
  id: string;
  template_id: string;
  line_number: number;
  cpt_code: string;
  units: number;
  fee_per_unit: number | null;
  modifier: string | null;
  notes: string | null;
};

/** Pro Injury authorization cap per case. */
export const AUTH_VISIT_CAP = 23;

/** Format money as US currency. */
export function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

/** Visit type labels (display). Mirrors visits.visit_type check constraint. */
export const VISIT_TYPE_LABELS: Record<string, string> = {
  eval: "Initial / Eval",
  reeval: "Re-eval",
  office: "Therapy",
  consult: "Consult",
  tele: "Telehealth",
  discharge: "Discharge",
  other: "Other",
};

/** Pretty-print a visit type code. */
export function fmtVisitType(t: string | null | undefined): string {
  if (!t) return "—";
  return VISIT_TYPE_LABELS[t] ?? t;
}
