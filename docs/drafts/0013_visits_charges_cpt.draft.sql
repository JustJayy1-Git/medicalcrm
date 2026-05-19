-- =============================================================
-- Pro Injury CRM — Visits, Charges, CPT codes, MultiLink templates
-- 2026-05-19 (migration 0013)
-- =============================================================
-- Implements the Medisoft "Transaction Entry" data model:
--   1. cpt_codes        — reference table for procedures we bill
--   2. visits           — one row per date of service per case
--   3. charges          — one row per CPT line on a visit (multiple per visit)
--   4. charge_diagnoses — many-to-many: charge ↔ icd_code, ordinal 1-6
--   5. multilink_templates / multilink_template_lines — preset bundles
--      (Initial visit, Therapy day, Follow-up — like Medisoft MultiLink)
--
-- Pro Injury business rules baked in:
--   - Standard auth cap per case = 23 visits
--   - Office sets its own self-pay fee schedule (one fee per CPT, no
--     per-carrier rates)
--   - Up to 6 diagnoses per charge line (matches Medisoft Diag 1-6 columns)
-- =============================================================

-- ----------------------------------------------------------------
-- 1. CPT code reference table
-- ----------------------------------------------------------------
create table if not exists public.cpt_codes (
  code            text primary key,                -- e.g. '97140'
  description     text not null,                   -- 'Manual therapy techniques, 1 or more regions, each 15 min'
  category        text,                            -- 'em', 'therapy', 'modality', 'eval', etc.
  default_fee     numeric(10, 2) not null default 0,
  default_units   int  not null default 1,
  is_active       boolean not null default true,
  notes           text,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index if not exists cpt_codes_active_idx
  on public.cpt_codes (is_active) where is_active = true;

-- ----------------------------------------------------------------
-- 2. Visits — one per date of service per case
-- ----------------------------------------------------------------
create table if not exists public.visits (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid not null references public.cases(id) on delete cascade,
  patient_id      uuid not null references public.patients(id) on delete cascade,

  visit_date      date not null,
  visit_number    int  not null,                   -- 1, 2, 3 ... up to authorized cap
  visit_type      text not null default 'therapy'
                   check (visit_type in ('initial','follow_up','therapy','discharge','other')),

  -- Provider rendering services (FK to providers if you have it; soft text fallback)
  provider_id     uuid,                            -- references public.providers(id) — soft FK for now
  place_of_service text not null default '11',     -- CMS POS code; '11' = office

  notes           text,
  is_voided       boolean not null default false,
  voided_reason   text,
  voided_at       timestamptz,

  created_at      timestamptz not null default timezone('utc', now()),
  created_by      uuid references auth.users(id) on delete set null,
  updated_at      timestamptz not null default timezone('utc', now()),

  -- Each case can only have one visit per (case, visit_number)
  unique (case_id, visit_number)
);

create index if not exists visits_case_date_idx     on public.visits (case_id, visit_date desc);
create index if not exists visits_patient_date_idx  on public.visits (patient_id, visit_date desc);
create index if not exists visits_date_idx          on public.visits (visit_date desc);

-- Auth-cap awareness (Pro Injury standard = 23). Stored on cases later if
-- variable; for now we only flag in the UI.
comment on column public.visits.visit_number is
  'Sequential visit number within the case. Pro Injury cap = 23 per case.';

-- ----------------------------------------------------------------
-- 3. Charges — one per CPT line on a visit
-- ----------------------------------------------------------------
create table if not exists public.charges (
  id              uuid primary key default gen_random_uuid(),
  visit_id        uuid not null references public.visits(id) on delete cascade,
  case_id         uuid not null references public.cases(id) on delete cascade,
  patient_id      uuid not null references public.patients(id) on delete cascade,

  line_number     int not null,                    -- 1, 2, 3... order on the visit
  cpt_code        text not null references public.cpt_codes(code) on delete restrict,

  units           int not null default 1 check (units >= 1),
  fee_per_unit    numeric(10, 2) not null check (fee_per_unit >= 0),
  -- total_amount is a generated column = units * fee_per_unit
  total_amount    numeric(12, 2) generated always as (units * fee_per_unit) stored,

  -- Modifiers — 4 slots (CMS-1500 standard). Most PT charges use GP / 59.
  modifier_1      text,
  modifier_2      text,
  modifier_3      text,
  modifier_4      text,

  -- Per-line POS override (defaults to visit POS in UI; null = inherit)
  place_of_service text,
  -- Per-line provider override
  provider_id     uuid,

  notes           text,
  is_voided       boolean not null default false,
  voided_reason   text,
  voided_at       timestamptz,

  created_at      timestamptz not null default timezone('utc', now()),
  created_by      uuid references auth.users(id) on delete set null,
  updated_at      timestamptz not null default timezone('utc', now()),

  unique (visit_id, line_number)
);

create index if not exists charges_visit_idx    on public.charges (visit_id, line_number);
create index if not exists charges_case_idx     on public.charges (case_id);
create index if not exists charges_patient_idx  on public.charges (patient_id);
create index if not exists charges_cpt_idx      on public.charges (cpt_code);

-- ----------------------------------------------------------------
-- 4. Charge diagnoses — up to 6 per charge (matches Medisoft Diag 1-6)
-- ----------------------------------------------------------------
create table if not exists public.charge_diagnoses (
  charge_id       uuid not null references public.charges(id) on delete cascade,
  ordinal         int  not null check (ordinal between 1 and 6),
  icd_code        text not null references public.icd_codes(code) on delete restrict,
  created_at      timestamptz not null default timezone('utc', now()),

  primary key (charge_id, ordinal)
);

create index if not exists charge_diagnoses_icd_idx on public.charge_diagnoses (icd_code);

-- ----------------------------------------------------------------
-- 5. MultiLink templates — preset CPT bundles
-- ----------------------------------------------------------------
create table if not exists public.multilink_templates (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,            -- 'initial_visit', 'therapy_day', 'follow_up'
  name            text not null,                   -- 'Initial visit', 'Therapy day', 'Follow-up'
  description     text,
  visit_type      text not null
                   check (visit_type in ('initial','follow_up','therapy','discharge','other')),
  sort_rank       int  not null default 100,
  is_active       boolean not null default true,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create table if not exists public.multilink_template_lines (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid not null references public.multilink_templates(id) on delete cascade,
  line_number     int  not null,
  cpt_code        text not null references public.cpt_codes(code) on delete restrict,
  units           int  not null default 1 check (units >= 1),
  -- if null at template level, use cpt_codes.default_fee at expansion time
  fee_per_unit    numeric(10, 2),
  modifier_1      text,
  modifier_2      text,
  notes           text,

  unique (template_id, line_number)
);

-- ----------------------------------------------------------------
-- 6. Seed CPT codes (Pro Injury common set)
-- ----------------------------------------------------------------
insert into public.cpt_codes (code, description, category, default_fee, default_units) values
  -- Evaluation & Management
  ('99204', 'Office/outpatient visit, new patient, 45-59 min (moderate)', 'em', 450.00, 1),
  ('99205', 'Office/outpatient visit, new patient, 60-74 min (high)',     'em', 550.00, 1),
  ('99213', 'Office/outpatient visit, established, 20-29 min (low)',      'em', 150.00, 1),
  ('99214', 'Office/outpatient visit, established, 30-39 min (moderate)', 'em', 200.00, 1),

  -- Therapy / modality codes (the Pro Injury daily bundle)
  ('97012', 'Application of mechanical traction',                          'modality', 50.00, 1),
  ('97032', 'Electrical stimulation, manual, each 15 min',                 'modality', 50.00, 2),
  ('97035', 'Ultrasound therapy, each 15 min',                             'modality', 45.00, 2),
  ('97110', 'Therapeutic exercise, each 15 min',                           'therapy',  80.00, 2),
  ('97112', 'Neuromuscular re-education, each 15 min',                     'therapy',  75.00, 2),
  ('97140', 'Manual therapy techniques, each 15 min',                      'therapy',  70.00, 2)
on conflict (code) do update set
  description    = excluded.description,
  category       = excluded.category,
  default_fee    = excluded.default_fee,
  default_units  = excluded.default_units,
  updated_at     = timezone('utc', now());

-- ----------------------------------------------------------------
-- 7. Seed MultiLink templates
-- ----------------------------------------------------------------

-- INITIAL VISIT — done once per case, E&M only
insert into public.multilink_templates (slug, name, description, visit_type, sort_rank)
values ('initial_visit', 'Initial visit', 'New patient evaluation (99204). Used once per case on day 1.', 'initial', 10)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description,
  visit_type = excluded.visit_type, sort_rank = excluded.sort_rank,
  updated_at = timezone('utc', now());

-- THERAPY DAY — the workhorse, used 21× per case
insert into public.multilink_templates (slug, name, description, visit_type, sort_rank)
values ('therapy_day', 'Therapy day', 'Standard PT bundle: 97035×2, 97140×2, 97032×2, 97110×2, 97112×2, 97012×1. Used 21× per case ($690/session).', 'therapy', 20)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description,
  visit_type = excluded.visit_type, sort_rank = excluded.sort_rank,
  updated_at = timezone('utc', now());

-- ----------------------------------------------------------------
-- 8. Seed MultiLink template lines
-- ----------------------------------------------------------------

-- Initial visit lines
insert into public.multilink_template_lines (template_id, line_number, cpt_code, units, fee_per_unit)
select t.id, 1, '99204', 1, 450.00
from public.multilink_templates t where t.slug = 'initial_visit'
on conflict (template_id, line_number) do update set
  cpt_code = excluded.cpt_code, units = excluded.units, fee_per_unit = excluded.fee_per_unit;

-- Therapy day lines (6 lines — the Pro Injury daily bundle)
with t as (select id from public.multilink_templates where slug = 'therapy_day')
insert into public.multilink_template_lines (template_id, line_number, cpt_code, units, fee_per_unit)
select t.id, ln, code, u, fee
from t,
     (values
       (1, '97035', 2,  45.00),
       (2, '97140', 2,  70.00),
       (3, '97032', 2,  50.00),
       (4, '97110', 2,  80.00),
       (5, '97112', 2,  75.00),
       (6, '97012', 1,  50.00)
     ) as v(ln, code, u, fee)
on conflict (template_id, line_number) do update set
  cpt_code     = excluded.cpt_code,
  units        = excluded.units,
  fee_per_unit = excluded.fee_per_unit;

-- ----------------------------------------------------------------
-- 9. Updated_at triggers (DRY — reuse existing helper if present)
-- ----------------------------------------------------------------
-- Assumes public.set_updated_at() exists from earlier migrations.
-- If not, this block is a no-op and we'll add the helper later.
do $$
begin
  if exists (select 1 from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'set_updated_at') then
    drop trigger if exists trg_cpt_codes_updated_at on public.cpt_codes;
    create trigger trg_cpt_codes_updated_at
      before update on public.cpt_codes
      for each row execute function public.set_updated_at();

    drop trigger if exists trg_visits_updated_at on public.visits;
    create trigger trg_visits_updated_at
      before update on public.visits
      for each row execute function public.set_updated_at();

    drop trigger if exists trg_charges_updated_at on public.charges;
    create trigger trg_charges_updated_at
      before update on public.charges
      for each row execute function public.set_updated_at();

    drop trigger if exists trg_multilink_templates_updated_at on public.multilink_templates;
    create trigger trg_multilink_templates_updated_at
      before update on public.multilink_templates
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- ----------------------------------------------------------------
-- 10. RLS — turn it on, define office-staff policies
-- ----------------------------------------------------------------
alter table public.cpt_codes                enable row level security;
alter table public.visits                   enable row level security;
alter table public.charges                  enable row level security;
alter table public.charge_diagnoses         enable row level security;
alter table public.multilink_templates      enable row level security;
alter table public.multilink_template_lines enable row level security;

-- Authenticated office staff can read reference data (CPT + templates)
drop policy if exists "cpt_read_auth"               on public.cpt_codes;
create policy "cpt_read_auth"
  on public.cpt_codes for select to authenticated using (true);

drop policy if exists "multilink_read_auth"         on public.multilink_templates;
create policy "multilink_read_auth"
  on public.multilink_templates for select to authenticated using (true);

drop policy if exists "multilink_lines_read_auth"   on public.multilink_template_lines;
create policy "multilink_lines_read_auth"
  on public.multilink_template_lines for select to authenticated using (true);

-- Authenticated users can manage clinical/financial data.
-- TODO: tighten by role (billing vs front-desk) once we have role claims.
drop policy if exists "visits_all_auth"             on public.visits;
create policy "visits_all_auth"
  on public.visits for all to authenticated using (true) with check (true);

drop policy if exists "charges_all_auth"            on public.charges;
create policy "charges_all_auth"
  on public.charges for all to authenticated using (true) with check (true);

drop policy if exists "charge_diagnoses_all_auth"   on public.charge_diagnoses;
create policy "charge_diagnoses_all_auth"
  on public.charge_diagnoses for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------
-- 11. Refresh PostgREST schema
-- ----------------------------------------------------------------
notify pgrst, 'reload schema';
