/** Client-safe intake form metadata (no Node fs). */

export type FormSlug =
  | "intake"
  | "disclosure"
  | "aob"
  | "hipaa"
  | "fraud"
  | "financial"
  | "treatment"
  | "records";

/** Full packet (staff / clinical — includes PIP disclosure for doctor visit). */
export const FORM_ORDER: FormSlug[] = [
  "intake",
  "disclosure",
  "aob",
  "hipaa",
  "fraud",
  "financial",
  "treatment",
  "records",
];

/** iPad kiosk patient flow — disclosure (page 2) held for clinical use. */
export const PORTAL_FORM_ORDER: FormSlug[] = [
  "intake",
  "aob",
  "hipaa",
  "fraud",
  "financial",
  "treatment",
  "records",
];

export const PORTAL_FORM_COUNT = PORTAL_FORM_ORDER.length;
export const FULL_FORM_COUNT = FORM_ORDER.length;

export const INTAKE_STORAGE_KEY = "proInjury.intake.v1";

const SLUG_SET = new Set<string>(FORM_ORDER);

export function isFormSlug(value: string): value is FormSlug {
  return SLUG_SET.has(value);
}

export function getFormNavigationOrder(mode: "kiosk" | "staff"): FormSlug[] {
  return mode === "kiosk" ? PORTAL_FORM_ORDER : FORM_ORDER;
}

export function getPortalPageNumber(slug: FormSlug): number {
  const idx = PORTAL_FORM_ORDER.indexOf(slug);
  return idx >= 0 ? idx + 1 : 0;
}

export function isPortalFormSlug(slug: FormSlug): boolean {
  return PORTAL_FORM_ORDER.includes(slug);
}
