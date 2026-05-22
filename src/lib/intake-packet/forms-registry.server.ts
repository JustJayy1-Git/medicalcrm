import "server-only";

import fs from "fs";
import path from "path";
import type { FormSlug } from "./form-slugs";

export type { FormSlug } from "./form-slugs";

export type FormDef = {
  slug: FormSlug;
  page: number;
  file: string;
  tableName: string;
  title: string;
  localStorageKey: string;
  fieldNames: string[];
  booleanFields: Set<string>;
  jsonArrayFields: Set<string>;
};

type ManifestForm = {
  file: string;
  page: number;
  table_name: string;
  title: string;
  localStorage_key: string;
  fields: Array<{ name: string; type: string; multi?: boolean }>;
};

const BOOLEAN_BY_TABLE: Record<string, string[]> = {
  pip_disclosure: [
    "svc_initial_visit",
    "svc_initial_therapist_eval",
    "svc_cold_hot",
    "svc_ultrasound",
    "svc_xrays",
    "svc_estim",
    "svc_massage",
    "svc_therapeutic",
    "svc_paraffin",
    "svc_infrared",
    "svc_other",
  ],
  hipaa_consent: [
    "no_restrictions",
    "consent_sms",
    "consent_email",
    "consent_voicemail",
    "consent_billing_electronic",
    "ack_received_npp",
  ],
  financial_consent: ["cc_visa", "cc_mc", "cc_amex", "cc_discover"],
  treatment_consent: ["not_pregnant_attest", "not_applicable"],
  records_release: [
    "expire_at_case_end",
    "sens_drug_alcohol",
    "sens_mental",
    "sens_hiv_aids",
    "sens_std",
    "sens_tb",
    "sens_genetic",
  ],
};

const JSON_ARRAY_FIELDS = new Set(["referral_source"]);

function resolveManifestPath(): string {
  const candidates = [
    path.join(process.cwd(), "intake-forms", "schema", "forms-manifest.json"),
    "/mnt/c/Users/Stric/MedicalCRM/intake-forms/schema/forms-manifest.json",
    path.join("C:", "Users", "Stric", "MedicalCRM", "intake-forms", "schema", "forms-manifest.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    "forms-manifest.json not found at intake-forms/schema/ or C:\\Users\\Stric\\MedicalCRM\\intake-forms\\schema\\",
  );
}

let cachedDefs: FormDef[] | null = null;

export function getFormDefs(): FormDef[] {
  if (cachedDefs) return cachedDefs;
  const manifest = JSON.parse(fs.readFileSync(resolveManifestPath(), "utf8")) as {
    forms: ManifestForm[];
  };
  cachedDefs = manifest.forms.map((f) => {
    const slug = f.file.replace(/\.html$/, "") as FormSlug;
    const booleanFields = new Set(BOOLEAN_BY_TABLE[f.table_name] ?? []);
    const jsonArrayFields = new Set(
      f.fields
        .filter((field) => field.multi && field.type === "checkbox")
        .map((field) => field.name),
    );
    for (const name of JSON_ARRAY_FIELDS) jsonArrayFields.add(name);

    return {
      slug,
      page: f.page,
      file: f.file,
      tableName: f.table_name,
      title: f.title,
      localStorageKey: f.localStorage_key,
      fieldNames: f.fields.map((field) => field.name),
      booleanFields,
      jsonArrayFields,
    };
  });
  return cachedDefs;
}

export function getFormBySlug(slug: FormSlug): FormDef {
  const def = getFormDefs().find((f) => f.slug === slug);
  if (!def) throw new Error(`Unknown form slug: ${slug}`);
  return def;
}
