-- Kiosk role + Pro Injury 8-page intake packet tables (Archie schema, CRM patients FK)

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'manager', 'staff', 'billing', 'readonly', 'kiosk'));

create table if not exists public.intake_packets (
  id                 bigserial primary key,
  patient_id         uuid not null references public.patients(id) on delete cascade,
  date_of_accident   date,
  intake_date        date,
  status             text not null default 'in_progress'
                     check (status in ('in_progress', 'completed', 'archived')),
  source             text not null default 'portal' check (source in ('portal', 'staff')),
  created_at         timestamptz not null default timezone('utc', now()),
  updated_at         timestamptz not null default timezone('utc', now())
);

create table if not exists public.patient_intake (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  meta_todays_date             date,
  meta_date_of_accident        date,
  meta_referred_by             text,
  meta_type_of_accident        text,
  language                     text,
  email                        text,
  patient_name                 text,
  marital                      text,
  addr_street                  text,
  addr_city                    text,
  addr_state                   text,
  addr_zip                     text,
  gender                       text,
  phone_home                   text,
  phone_cell                   text,
  client_role                  text,
  dob                          date,
  emergency_contact            text,
  rescue                       text,
  hospital                     text,
  hospital_name                text,
  pip_carrier                  text,
  pip_policy                   text,
  pip_claim                    text,
  pip_address                  text,
  pip_adjuster                 text,
  pip_phone                    text,
  pip_fax                      text,
  acc_time_location            text,
  acc_crash_report             text,
  inj_initial                  text,
  acc_prior_surgeries          text,
  inj_treating_facility        text,
  patient_initials             text,
  acc_summary                  text,
  unique (packet_id)
);

create table if not exists public.pip_disclosure (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  patient_name                 text,
  patient_dob                  date,
  patient_phone                text,
  date_of_accident             date,
  svc_initial_visit            boolean,
  svc_initial_therapist_eval   boolean,
  svc_cold_hot                 boolean,
  svc_ultrasound               boolean,
  svc_xrays                    boolean,
  svc_estim                    boolean,
  svc_massage                  boolean,
  svc_therapeutic              boolean,
  svc_paraffin                 boolean,
  svc_infrared                 boolean,
  svc_other                    boolean,
  svc_other_text               text,
  insured_name_print           text,
  insured_signature            text,
  insured_signed_date          date,
  provider_name_print          text,
  provider_signature           text,
  provider_signed_date         date,
  patient_initials_p2          text,
  unique (packet_id)
);

create table if not exists public.assignment_benefits (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  patient_name                 text,
  patient_dob                  date,
  patient_phone                text,
  patient_name_print           text,
  patient_signature            text,
  patient_signed_date          date,
  patient_initials_p3          text,
  unique (packet_id)
);

create table if not exists public.hipaa_consent (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  patient_name                 text,
  patient_dob                  date,
  patient_phone                text,
  no_restrictions              boolean,
  consent_sms                  boolean,
  consent_email                boolean,
  consent_voicemail            boolean,
  consent_billing_electronic   boolean,
  referral_source              text,
  referral_source_other        text,
  ack_received_npp             boolean,
  patient_name_print           text,
  patient_signature            text,
  patient_signed_date          date,
  guardian_name                text,
  guardian_signature           text,
  guardian_relationship        text,
  witness_name                 text,
  witness_signature            text,
  witness_date                 date,
  patient_initials_p4          text,
  restrictions                 text,
  unique (packet_id)
);

create table if not exists public.fraud_statement (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  patient_name                 text,
  patient_dob                  date,
  patient_phone                text,
  date_of_accident             date,
  fraud_name_print             text,
  fraud_signature              text,
  fraud_signed_date            date,
  patient_initials_p5          text,
  unique (packet_id)
);

create table if not exists public.financial_consent (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  patient_name                 text,
  patient_dob                  date,
  patient_phone                text,
  deductible_choice            text,
  cc_visa                      boolean,
  cc_mc                        boolean,
  cc_amex                      boolean,
  cc_discover                  boolean,
  attorney_firm                text,
  attorney_name                text,
  attorney_phone               text,
  financial_name_print         text,
  financial_signature          text,
  financial_signed_date        date,
  patient_initials_p6          text,
  unique (packet_id)
);

create table if not exists public.treatment_consent (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  patient_name                 text,
  patient_dob                  date,
  patient_phone                text,
  not_pregnant_attest          boolean,
  not_applicable               boolean,
  treatment_name_print         text,
  treatment_signature          text,
  treatment_signed_date        date,
  patient_initials_p7          text,
  unique (packet_id)
);

create table if not exists public.records_release (
  id           bigserial primary key,
  packet_id    bigint not null references public.intake_packets(id) on delete cascade,
  signed_at    timestamptz,
  patient_name                 text,
  patient_dob                  date,
  patient_phone                text,
  date_of_accident             date,
  release_from_name            text,
  release_from_phone           text,
  release_from_address         text,
  expiration_date              date,
  expire_at_case_end           boolean,
  sens_drug_alcohol            boolean,
  sens_mental                  boolean,
  sens_hiv_aids                boolean,
  sens_std                     boolean,
  sens_tb                      boolean,
  sens_genetic                 boolean,
  records_name_print           text,
  records_signature            text,
  records_signed_date          date,
  witness_name                 text,
  witness_signature            text,
  witness_date                 date,
  patient_initials_p8          text,
  unique (packet_id)
);

create index if not exists idx_intake_packets_patient on public.intake_packets(patient_id);
create index if not exists idx_intake_packets_status on public.intake_packets(status);

drop trigger if exists intake_packets_set_updated_at on public.intake_packets;
create trigger intake_packets_set_updated_at
  before update on public.intake_packets
  for each row execute function public.set_updated_at();

-- RLS: active staff (includes kiosk) can read/write intake tables
alter table public.intake_packets enable row level security;
alter table public.patient_intake enable row level security;
alter table public.pip_disclosure enable row level security;
alter table public.assignment_benefits enable row level security;
alter table public.hipaa_consent enable row level security;
alter table public.fraud_statement enable row level security;
alter table public.financial_consent enable row level security;
alter table public.treatment_consent enable row level security;
alter table public.records_release enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'intake_packets', 'patient_intake', 'pip_disclosure', 'assignment_benefits',
    'hipaa_consent', 'fraud_statement', 'financial_consent', 'treatment_consent',
    'records_release'
  ]
  loop
    execute format('drop policy if exists %I_staff_all on public.%I', tbl, tbl);
    execute format(
      'create policy %I_staff_all on public.%I for all to authenticated using (public.is_active_staff()) with check (public.is_active_staff())',
      tbl, tbl
    );
  end loop;
end $$;
