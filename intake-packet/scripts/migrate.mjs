#!/usr/bin/env node
import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const { Pool } = pg;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const schemaCandidates = [
  path.join(root, "intake-forms", "schema", "schema.sql"),
  "/mnt/c/Users/Stric/MedicalCRM/intake-forms/schema/schema.sql",
  "C:\\Users\\Stric\\MedicalCRM\\intake-forms\\schema\\schema.sql",
];
const schemaPath = schemaCandidates.find((p) => fs.existsSync(p));
if (!schemaPath) {
  console.error("schema.sql not found. Run npm run sync-forms.");
  process.exit(1);
}
const extra = `
CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_intake_packet ON patient_intake(packet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_pip_disclosure_packet ON pip_disclosure(packet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_assignment_benefits_packet ON assignment_benefits(packet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_hipaa_consent_packet ON hipaa_consent(packet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_fraud_statement_packet ON fraud_statement(packet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_financial_consent_packet ON financial_consent(packet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_treatment_consent_packet ON treatment_consent(packet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_records_release_packet ON records_release(packet_id);
ALTER TABLE hipaa_consent ALTER COLUMN referral_source TYPE TEXT USING (
  CASE WHEN referral_source IS TRUE THEN '[]' WHEN referral_source IS FALSE THEN NULL ELSE referral_source::text END
);
`;

const sql = fs.readFileSync(schemaPath, "utf8") + extra;
await pool.query(sql);
await pool.end();
console.log("Migration complete");
