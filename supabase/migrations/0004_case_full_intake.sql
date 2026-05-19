-- =============================================================
-- Pro Injury CRM — Case intake expansion (Personal / Condition /
-- Diagnosis / Policy / Authorization / Comments)
-- 2026-05-18 (migration 0004)
-- =============================================================

alter table public.cases
  -- Personal extras
  add column if not exists global_coverage_until   date,
  add column if not exists print_patient_statement boolean not null default true,
  add column if not exists cash_case               boolean not null default false,

  -- Providers / referral
  add column if not exists assigned_provider_id    uuid references public.providers(id) on delete set null,
  add column if not exists referring_provider_id   uuid references public.providers(id) on delete set null,
  add column if not exists referral_source         text,
  add column if not exists facility                text,

  -- Condition extras
  add column if not exists illness_date            date,
  add column if not exists initial_treatment_date  date,
  add column if not exists same_or_similar_symptoms boolean default false,
  add column if not exists similar_symptoms_date   date,
  add column if not exists accident_state          text,
  add column if not exists accident_nature         text,
  add column if not exists unable_to_work_from     date,
  add column if not exists unable_to_work_to       date,
  add column if not exists total_disability_from   date,
  add column if not exists total_disability_to     date,
  add column if not exists partial_disability_from date,
  add column if not exists partial_disability_to   date,
  add column if not exists hospitalization_from    date,
  add column if not exists hospitalization_to      date,

  -- Diagnosis (up to 8 ICD-10 codes; principal first)
  add column if not exists diagnosis_codes         text[] default '{}',

  -- Secondary policy
  add column if not exists secondary_policy_number text,
  add column if not exists secondary_group_number  text,
  add column if not exists secondary_group_name    text,
  add column if not exists secondary_adjuster_name text,
  add column if not exists secondary_adjuster_phone text,
  add column if not exists secondary_adjuster_email text,
  add column if not exists secondary_policy_start  date,
  add column if not exists secondary_policy_end    date,

  -- Primary policy extras
  add column if not exists primary_group_number    text,
  add column if not exists primary_group_name      text,
  add column if not exists primary_policy_start    date,
  add column if not exists primary_policy_end      date,
  add column if not exists accept_assignment       boolean not null default true,
  add column if not exists deductible_amount       numeric(10, 2),
  add column if not exists copay_amount            numeric(10, 2),
  add column if not exists deductible_met          boolean default false,

  -- Authorization tracking (Florida PIP cap, e.g. $2,500 emergency / $10,000 cap)
  add column if not exists authorization_number    text,
  add column if not exists authorized_visits       int,
  add column if not exists authorized_through      date,
  add column if not exists last_visit_date         date,
  add column if not exists last_visit_number       int,

  -- Comments (separate from internal notes — these are case working comments)
  add column if not exists comments                text;

create index if not exists cases_assigned_provider_idx on public.cases (assigned_provider_id);
create index if not exists cases_referring_provider_idx on public.cases (referring_provider_id);
