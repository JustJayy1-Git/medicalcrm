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

export const INTAKE_STORAGE_KEY = "proInjury.intake.v1";

const SLUG_SET = new Set<string>(FORM_ORDER);

export function isFormSlug(value: string): value is FormSlug {
  return SLUG_SET.has(value);
}
