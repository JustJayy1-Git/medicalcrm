-- =============================================================
-- Pro Injury CRM — Charge Entry seed + MultiLink templates
-- 2026-05-19 (migration 0014)
-- =============================================================
-- Adds the missing pieces for Transaction Entry on top of the
-- existing visits/charges/cpt_codes/icd_codes schema from 0001:
--
--   1. visits.visit_number              (1..23 sequential per case)
--   2. charges.line_number              (display order per visit)
--   3. cpt_codes seed                   (10 Pro Injury common codes)
--   4. multilink_templates              (preset CPT bundles)
--   5. multilink_template_lines         (the bundle contents)
--   6. RLS policies + PostgREST refresh
--
-- Notes:
--   - visits / charges / cpt_codes / icd_codes already exist (0001).
--   - charges.icd_codes is text[] — already supports up to N dx per line.
--   - Pro Injury auth cap = 23 visits per case.
-- =============================================================

-- ----------------------------------------------------------------
-- 1. Extend visits with visit_number
-- ----------------------------------------------------------------
alter table public.visits
  add column if not exists visit_number int;

-- Backfill: if any existing rows lack a visit_number, assign by date order
do $$
begin
  if exists (select 1 from public.visits where visit_number is null limit 1) then
    with ordered as (
      select id,
             row_number() over (partition by case_id order by visit_date, created_at) as rn
      from public.visits
      where visit_number is null and case_id is not null
    )
    update public.visits v
       set visit_number = o.rn
      from ordered o
     where v.id = o.id;
  end if;
end $$;

-- Enforce uniqueness once data is consistent
create unique index if not exists visits_case_visit_number_uidx
  on public.visits (case_id, visit_number)
  where case_id is not null and visit_number is not null;

comment on column public.visits.visit_number is
  'Sequential visit number within the case. Pro Injury cap = 23 per case.';

-- ----------------------------------------------------------------
-- 2. Extend charges with line_number (for stable display order)
-- ----------------------------------------------------------------
alter table public.charges
  add column if not exists line_number int;

-- Backfill: order by created_at within each visit
do $$
begin
  if exists (select 1 from public.charges where line_number is null limit 1) then
    with ordered as (
      select id,
             row_number() over (partition by visit_id order by created_at) as rn
      from public.charges
      where line_number is null
    )
    update public.charges c
       set line_number = o.rn
      from ordered o
     where c.id = o.id;
  end if;
end $$;

create unique index if not exists charges_visit_line_uidx
  on public.charges (visit_id, line_number)
  where line_number is not null;

-- ----------------------------------------------------------------
-- 3. Add category column to cpt_codes (for grouping in UI)
-- ----------------------------------------------------------------
alter table public.cpt_codes
  add column if not exists category text;

create index if not exists cpt_codes_category_idx
  on public.cpt_codes (category) where category is not null;

-- ----------------------------------------------------------------
-- 4. Seed cpt_codes — Pro Injury common 10
-- ----------------------------------------------------------------
insert into public.cpt_codes (code, description, default_fee, is_active, category) values
  -- Evaluation & Management
  ('99204', 'Office/outpatient visit, new patient, 45-59 min (moderate)', 450.00, true, 'em'),
  ('99205', 'Office/outpatient visit, new patient, 60-74 min (high)',     550.00, true, 'em'),
  ('99213', 'Office/outpatient visit, established, 20-29 min (low)',      150.00, true, 'em'),
  ('99214', 'Office/outpatient visit, established, 30-39 min (moderate)', 200.00, true, 'em'),

  -- Therapy & modality (the Pro Injury daily bundle)
  ('97012', 'Application of mechanical traction',                          50.00, true, 'modality'),
  ('97032', 'Electrical stimulation, manual, each 15 min',                 50.00, true, 'modality'),
  ('97035', 'Ultrasound therapy, each 15 min',                             45.00, true, 'modality'),
  ('97110', 'Therapeutic exercise, each 15 min',                           80.00, true, 'therapy'),
  ('97112', 'Neuromuscular re-education, each 15 min',                     75.00, true, 'therapy'),
  ('97140', 'Manual therapy techniques, each 15 min',                      70.00, true, 'therapy')
on conflict (code) do update set
  description = excluded.description,
  default_fee = excluded.default_fee,
  is_active   = excluded.is_active,
  category    = excluded.category;

-- ----------------------------------------------------------------
-- 5. MultiLink templates (preset bundles)
-- ----------------------------------------------------------------
create table if not exists public.multilink_templates (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  description     text,
  visit_type      text not null
                   check (visit_type in ('eval','reeval','office','consult','tele','discharge','other')),
  sort_rank       int  not null default 100,
  is_active       boolean not null default true,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

drop trigger if exists multilink_templates_set_updated_at on public.multilink_templates;
create trigger multilink_templates_set_updated_at
  before update on public.multilink_templates
  for each row execute function public.set_updated_at();

create table if not exists public.multilink_template_lines (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid not null references public.multilink_templates(id) on delete cascade,
  line_number     int  not null,
  cpt_code        text not null references public.cpt_codes(code) on delete restrict,
  units           int  not null default 1 check (units >= 1),
  fee_per_unit    numeric(10, 2),    -- null = use cpt_codes.default_fee at expansion time
  modifier        text,
  notes           text,
  created_at      timestamptz not null default timezone('utc', now()),

  unique (template_id, line_number)
);

-- ----------------------------------------------------------------
-- 6. Seed MultiLink templates
-- ----------------------------------------------------------------

-- INITIAL VISIT (E&M only, used once per case on day 1)
insert into public.multilink_templates (slug, name, description, visit_type, sort_rank)
values (
  'initial_visit',
  'Initial visit',
  'New patient evaluation (99204). Used once per case on day 1.',
  'eval',
  10
)
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  visit_type  = excluded.visit_type,
  sort_rank   = excluded.sort_rank,
  updated_at  = timezone('utc', now());

insert into public.multilink_template_lines
  (template_id, line_number, cpt_code, units, fee_per_unit)
select t.id, 1, '99204', 1, 450.00
from public.multilink_templates t where t.slug = 'initial_visit'
on conflict (template_id, line_number) do update set
  cpt_code     = excluded.cpt_code,
  units        = excluded.units,
  fee_per_unit = excluded.fee_per_unit;

-- THERAPY DAY (used 21x per case, ~$690 per session)
insert into public.multilink_templates (slug, name, description, visit_type, sort_rank)
values (
  'therapy_day',
  'Therapy day',
  'Standard PT bundle: 97035x2 + 97140x2 + 97032x2 + 97110x2 + 97112x2 + 97012x1. Used 21x per case ($690/session).',
  'office',
  20
)
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  visit_type  = excluded.visit_type,
  sort_rank   = excluded.sort_rank,
  updated_at  = timezone('utc', now());

with t as (select id from public.multilink_templates where slug = 'therapy_day')
insert into public.multilink_template_lines
  (template_id, line_number, cpt_code, units, fee_per_unit)
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
-- 7. RLS for the new tables
-- ----------------------------------------------------------------
alter table public.multilink_templates      enable row level security;
alter table public.multilink_template_lines enable row level security;

drop policy if exists multilink_templates_staff_all on public.multilink_templates;
create policy multilink_templates_staff_all on public.multilink_templates
  for all to authenticated
  using  (public.is_active_staff())
  with check (public.is_active_staff());

drop policy if exists multilink_template_lines_staff_all on public.multilink_template_lines;
create policy multilink_template_lines_staff_all on public.multilink_template_lines
  for all to authenticated
  using  (public.is_active_staff())
  with check (public.is_active_staff());

-- ----------------------------------------------------------------
-- 8. Refresh PostgREST so the API sees the new tables/columns
-- ----------------------------------------------------------------
notify pgrst, 'reload schema';
