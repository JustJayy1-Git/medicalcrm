import type { SupabaseClient } from "@supabase/supabase-js";
import { PORTAL_FORM_ORDER, type FormSlug } from "./form-slugs";
import { loadPacketForms, type FormPayload } from "./form-persistence";

export type IntakeValidationIssue = {
  slug: FormSlug;
  page: number;
  field: string;
  label: string;
};

export type IntakeValidationResult = {
  ok: boolean;
  issues: IntakeValidationIssue[];
};

function str(value: unknown): string {
  return String(value ?? "").trim();
}

function hasSignature(value: unknown): boolean {
  const s = str(value);
  return s.startsWith("data:image") && s.length > 80;
}

function hasDate(value: unknown): boolean {
  return str(value).length > 0;
}

type Rule = {
  field: string;
  label: string;
  kind: "text" | "date" | "signature";
};

const RULES: Partial<Record<FormSlug, Rule[]>> = {
  intake: [
    { field: "patient_name", label: "Patient name (page 1)", kind: "text" },
    { field: "dob", label: "Date of birth (page 1)", kind: "date" },
    { field: "meta_todays_date", label: "Today's date (page 1)", kind: "date" },
  ],
  aob: [
    { field: "patient_name_print", label: "Printed name (AOB)", kind: "text" },
    { field: "patient_signed_date", label: "Date signed (AOB)", kind: "date" },
    { field: "patient_signature", label: "Signature (AOB)", kind: "signature" },
  ],
  hipaa: [
    { field: "patient_name_print", label: "Printed name (HIPAA)", kind: "text" },
    { field: "patient_signed_date", label: "Date signed (HIPAA)", kind: "date" },
    { field: "patient_signature", label: "Patient signature (HIPAA)", kind: "signature" },
  ],
  fraud: [
    { field: "fraud_name_print", label: "Printed name (Fraud)", kind: "text" },
    { field: "fraud_signed_date", label: "Date signed (Fraud)", kind: "date" },
    { field: "fraud_signature", label: "Signature (Fraud)", kind: "signature" },
  ],
  financial: [
    { field: "financial_name_print", label: "Printed name (Financial)", kind: "text" },
    { field: "financial_signed_date", label: "Date signed (Financial)", kind: "date" },
    { field: "financial_signature", label: "Signature (Financial)", kind: "signature" },
  ],
  treatment: [
    { field: "treatment_name_print", label: "Printed name (Treatment)", kind: "text" },
    { field: "treatment_signed_date", label: "Date signed (Treatment)", kind: "date" },
    { field: "treatment_signature", label: "Signature (Treatment)", kind: "signature" },
  ],
  records: [
    { field: "records_name_print", label: "Printed name (Records)", kind: "text" },
    { field: "records_signed_date", label: "Date signed (Records)", kind: "date" },
    { field: "records_signature", label: "Signature (Records)", kind: "signature" },
  ],
};

export function validatePacketForms(
  forms: Partial<Record<FormSlug, FormPayload>>,
): IntakeValidationResult {
  const issues: IntakeValidationIssue[] = [];

  for (let i = 0; i < PORTAL_FORM_ORDER.length; i += 1) {
    const slug = PORTAL_FORM_ORDER[i];
    const page = i + 1;
    const data = forms[slug] ?? {};
    const rules = RULES[slug] ?? [];

    for (const rule of rules) {
      const raw = data[rule.field];
      let missing = false;
      if (rule.kind === "signature") missing = !hasSignature(raw);
      else if (rule.kind === "date") missing = !hasDate(raw);
      else missing = !str(raw);

      if (missing) {
        issues.push({ slug, page, field: rule.field, label: rule.label });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

export async function validatePortalPacket(
  supabase: SupabaseClient,
  packetId: number,
): Promise<IntakeValidationResult> {
  const loaded = await loadPacketForms(supabase, packetId);
  return validatePacketForms(loaded.forms);
}
