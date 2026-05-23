-- Pro Injury Intake Packet -- SQL Schema
-- Generated from form HTML by extract_manifest.py
-- DB: PostgreSQL flavor (adjust types for MySQL/SQLite)
-- ============================================================

-- Master patient record. Each intake packet links to one patient.
CREATE TABLE IF NOT EXISTS patients (
  id              SERIAL PRIMARY KEY,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  external_id     VARCHAR(64) UNIQUE,
  full_name       VARCHAR(255),
  date_of_birth   DATE,
  phone           VARCHAR(32),
  email           VARCHAR(255),
  active          BOOLEAN NOT NULL DEFAULT TRUE
);

-- One intake packet per (patient + date of accident).
CREATE TABLE IF NOT EXISTS intake_packets (
  id                 SERIAL PRIMARY KEY,
  patient_id         INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date_of_accident   DATE,
  intake_date        DATE,
  status             VARCHAR(32) NOT NULL DEFAULT 'in_progress', -- in_progress | completed | archived
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- patient_intake
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_intake (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  meta_todays_date             DATE,
  meta_date_of_accident        DATE,
  meta_referred_by             VARCHAR(255),
  meta_type_of_accident        VARCHAR(255),
  language                     VARCHAR(64),  -- multi-value (store comma-sep or JSON array)
  email                        VARCHAR(255),
  patient_name                 VARCHAR(255),
  marital                      VARCHAR(64),  -- multi-value (store comma-sep or JSON array)
  addr_street                  VARCHAR(255),
  addr_city                    VARCHAR(255),
  addr_state                   VARCHAR(2),
  addr_zip                     VARCHAR(10),
  gender                       VARCHAR(64),  -- multi-value (store comma-sep or JSON array)
  phone_home                   VARCHAR(32),
  phone_cell                   VARCHAR(32),
  client_role                  VARCHAR(64),  -- multi-value (store comma-sep or JSON array)
  dob                          DATE,
  emergency_contact            VARCHAR(255),
  rescue                       VARCHAR(64),  -- multi-value (store comma-sep or JSON array)
  hospital                     VARCHAR(64),  -- multi-value (store comma-sep or JSON array)
  hospital_name                VARCHAR(255),
  pip_carrier                  VARCHAR(255),
  pip_policy                   VARCHAR(64),
  pip_claim                    VARCHAR(64),
  pip_address                  VARCHAR(255),
  pip_adjuster                 VARCHAR(255),
  pip_phone                    VARCHAR(32),
  pip_fax                      VARCHAR(32),
  attorney_firm                VARCHAR(255),
  attorney_name                VARCHAR(255),
  attorney_phone               VARCHAR(32),
  attorney_email               VARCHAR(255),
  acc_time_location            VARCHAR(255),
  acc_crash_report             VARCHAR(255),
  inj_initial                  VARCHAR(255),
  acc_prior_surgeries          VARCHAR(255),
  inj_treating_facility        VARCHAR(255),
  patient_initials             VARCHAR(255),
  acc_summary                  TEXT
);

-- ============================================================
-- pip_disclosure
-- ============================================================
CREATE TABLE IF NOT EXISTS pip_disclosure (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  patient_name                 VARCHAR(255),
  patient_dob                  DATE,
  patient_phone                VARCHAR(32),
  date_of_accident             DATE,
  svc_initial_visit            BOOLEAN,
  svc_initial_therapist_eval   BOOLEAN,
  svc_cold_hot                 BOOLEAN,
  svc_ultrasound               BOOLEAN,
  svc_xrays                    BOOLEAN,
  svc_estim                    BOOLEAN,
  svc_massage                  BOOLEAN,
  svc_therapeutic              BOOLEAN,
  svc_paraffin                 BOOLEAN,
  svc_infrared                 BOOLEAN,
  svc_other                    BOOLEAN,
  svc_other_text               VARCHAR(255),
  insured_name_print           VARCHAR(255),
  insured_signature            VARCHAR(255),
  insured_signed_date          DATE,
  provider_name_print          VARCHAR(255),
  provider_signature           VARCHAR(255),
  provider_signed_date         DATE,
  patient_initials_p2          VARCHAR(255)
);

-- ============================================================
-- assignment_benefits
-- ============================================================
CREATE TABLE IF NOT EXISTS assignment_benefits (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  patient_name                 VARCHAR(255),
  patient_dob                  DATE,
  patient_phone                VARCHAR(32),
  patient_name_print           VARCHAR(255),
  patient_signature            VARCHAR(255),
  patient_signed_date          DATE,
  patient_initials_p3          VARCHAR(255)
);

-- ============================================================
-- hipaa_consent
-- ============================================================
CREATE TABLE IF NOT EXISTS hipaa_consent (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  patient_name                 VARCHAR(255),
  patient_dob                  DATE,
  patient_phone                VARCHAR(32),
  no_restrictions              BOOLEAN,
  consent_sms                  BOOLEAN,
  consent_email                BOOLEAN,
  consent_voicemail            BOOLEAN,
  consent_billing_electronic   BOOLEAN,
  referral_source              BOOLEAN,  -- multi-value (store comma-sep or JSON array)
  referral_source_other        VARCHAR(255),
  ack_received_npp             BOOLEAN,
  patient_name_print           VARCHAR(255),
  patient_signature            VARCHAR(255),
  patient_signed_date          DATE,
  guardian_name                VARCHAR(255),
  guardian_signature           VARCHAR(255),
  guardian_relationship        VARCHAR(255),
  witness_name                 VARCHAR(255),
  witness_signature            VARCHAR(255),
  witness_date                 DATE,
  patient_initials_p4          VARCHAR(255),
  restrictions                 TEXT
);

-- ============================================================
-- fraud_statement
-- ============================================================
CREATE TABLE IF NOT EXISTS fraud_statement (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  patient_name                 VARCHAR(255),
  patient_dob                  DATE,
  patient_phone                VARCHAR(32),
  date_of_accident             DATE,
  fraud_name_print             VARCHAR(255),
  fraud_signature              VARCHAR(255),
  fraud_signed_date            DATE,
  patient_initials_p5          VARCHAR(255)
);

-- ============================================================
-- financial_consent
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_consent (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  patient_name                 VARCHAR(255),
  patient_dob                  DATE,
  patient_phone                VARCHAR(32),
  deductible_choice            VARCHAR(64),  -- multi-value (store comma-sep or JSON array)
  cc_visa                      BOOLEAN,
  cc_mc                        BOOLEAN,
  cc_amex                      BOOLEAN,
  cc_discover                  BOOLEAN,
  attorney_firm                VARCHAR(255),
  attorney_name                VARCHAR(255),
  attorney_phone               VARCHAR(255),
  financial_name_print         VARCHAR(255),
  financial_signature          VARCHAR(255),
  financial_signed_date        DATE,
  patient_initials_p6          VARCHAR(255)
);

-- ============================================================
-- treatment_consent
-- ============================================================
CREATE TABLE IF NOT EXISTS treatment_consent (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  patient_name                 VARCHAR(255),
  patient_dob                  DATE,
  patient_phone                VARCHAR(32),
  not_pregnant_attest          BOOLEAN,
  not_applicable               BOOLEAN,
  treatment_name_print         VARCHAR(255),
  treatment_signature          VARCHAR(255),
  treatment_signed_date        DATE,
  patient_initials_p7          VARCHAR(255)
);

-- ============================================================
-- records_release
-- ============================================================
CREATE TABLE IF NOT EXISTS records_release (
  id           SERIAL PRIMARY KEY,
  packet_id    INTEGER NOT NULL REFERENCES intake_packets(id) ON DELETE CASCADE,
  signed_at    TIMESTAMP,
  patient_name                 VARCHAR(255),
  patient_dob                  DATE,
  patient_phone                VARCHAR(32),
  date_of_accident             DATE,
  release_from_name            VARCHAR(255),
  release_from_phone           VARCHAR(32),
  release_from_address         VARCHAR(255),
  expiration_date              DATE,
  expire_at_case_end           BOOLEAN,
  sens_drug_alcohol            BOOLEAN,
  sens_mental                  BOOLEAN,
  sens_hiv_aids                BOOLEAN,
  sens_std                     BOOLEAN,
  sens_tb                      BOOLEAN,
  sens_genetic                 BOOLEAN,
  records_name_print           VARCHAR(255),
  records_signature            VARCHAR(255),
  records_signed_date          DATE,
  witness_name                 VARCHAR(255),
  witness_signature            VARCHAR(255),
  witness_date                 DATE,
  patient_initials_p8          VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_packets_patient ON intake_packets(patient_id);
CREATE INDEX IF NOT EXISTS idx_packets_status ON intake_packets(status);
CREATE INDEX IF NOT EXISTS idx_patient_intake_packet ON patient_intake(packet_id);
CREATE INDEX IF NOT EXISTS idx_pip_disclosure_packet ON pip_disclosure(packet_id);
CREATE INDEX IF NOT EXISTS idx_assignment_benefits_packet ON assignment_benefits(packet_id);
CREATE INDEX IF NOT EXISTS idx_hipaa_consent_packet ON hipaa_consent(packet_id);
CREATE INDEX IF NOT EXISTS idx_fraud_statement_packet ON fraud_statement(packet_id);
CREATE INDEX IF NOT EXISTS idx_financial_consent_packet ON financial_consent(packet_id);
CREATE INDEX IF NOT EXISTS idx_treatment_consent_packet ON treatment_consent(packet_id);
CREATE INDEX IF NOT EXISTS idx_records_release_packet ON records_release(packet_id);