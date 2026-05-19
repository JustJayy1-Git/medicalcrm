-- =============================================================
-- Pro Injury CRM — initial schema
-- 2026-05-18
-- =============================================================
-- Run this in your Supabase SQL editor (Database → SQL Editor → New query).
-- It creates the core PI-billing data model + RLS policies.
-- Idempotent: safe to re-run during dev.

-- -------------------------------------------------------------
-- 1. Extensions
-- -------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- 2. Helper: updated_at trigger
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- -------------------------------------------------------------
-- 3. profiles  (1:1 with auth.users — staff metadata + role)
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  role         text not null default 'staff'
                 check (role in ('admin', 'manager', 'staff', 'billing', 'readonly')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any existing auth users that don't yet have a profile
insert into public.profiles (id, email, full_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', email)
from auth.users
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- 4. Reference / list data (Medisoft's "Lists")
-- -------------------------------------------------------------

-- 4a. insurance_carriers (PIP, MedPay, BI carriers, etc.)
create table if not exists public.insurance_carriers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  carrier_type    text check (carrier_type in ('auto', 'health', 'workers_comp', 'other')) default 'auto',
  payer_id        text,                       -- electronic claims clearinghouse ID
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  zip             text,
  phone           text,
  fax             text,
  email           text,
  notes           text,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);
create index if not exists insurance_carriers_name_idx on public.insurance_carriers (lower(name));

drop trigger if exists ins_carriers_set_updated_at on public.insurance_carriers;
create trigger ins_carriers_set_updated_at
  before update on public.insurance_carriers
  for each row execute function public.set_updated_at();

-- 4b. attorneys (for LOP / personal injury cases)
create table if not exists public.attorneys (
  id              uuid primary key default gen_random_uuid(),
  firm_name       text,
  attorney_name   text not null,
  phone           text,
  fax             text,
  email           text,
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  zip             text,
  notes           text,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);
create index if not exists attorneys_name_idx on public.attorneys (lower(attorney_name));

drop trigger if exists attorneys_set_updated_at on public.attorneys;
create trigger attorneys_set_updated_at
  before update on public.attorneys
  for each row execute function public.set_updated_at();

-- 4c. providers (clinicians who render services)
create table if not exists public.providers (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  credentials     text,                       -- e.g. "DC", "DPT", "MD"
  npi             text,                       -- National Provider Identifier
  tax_id          text,                       -- for billing
  taxonomy_code   text,
  phone           text,
  email           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

-- 4d. cpt_codes / diagnosis_codes (lookup tables — seed minimal, full set imported later)
create table if not exists public.cpt_codes (
  code         text primary key,
  description  text not null,
  default_fee  numeric(10, 2),
  is_active    boolean not null default true
);

create table if not exists public.icd_codes (
  code         text primary key,             -- ICD-10 code (e.g. S13.4XXA)
  description  text not null,
  is_active    boolean not null default true
);

-- -------------------------------------------------------------
-- 5. patients (the core PHI entity)
-- -------------------------------------------------------------
create table if not exists public.patients (
  id                  uuid primary key default gen_random_uuid(),

  -- Identity
  first_name          text not null,
  middle_name         text,
  last_name           text not null,
  preferred_name      text,
  date_of_birth       date,
  sex                 text check (sex in ('M', 'F', 'X')),
  ssn_last4           text,                  -- store only last 4, full SSN encrypted-at-rest later if needed

  -- Contact
  phone               text,
  phone_alt           text,
  email               text,
  preferred_contact   text check (preferred_contact in ('phone', 'phone_alt', 'email', 'text')),

  -- Address
  address_line1       text,
  address_line2       text,
  city                text,
  state               text,
  zip                 text,

  -- Emergency contact
  emergency_name      text,
  emergency_phone     text,
  emergency_relation  text,

  -- Misc
  language            text default 'en',
  notes               text,

  -- Lifecycle
  status              text not null default 'active'
                       check (status in ('active', 'inactive', 'discharged', 'deceased')),

  created_at          timestamptz not null default timezone('utc', now()),
  created_by          uuid references public.profiles(id),
  updated_at          timestamptz not null default timezone('utc', now())
);
create index if not exists patients_last_first_idx on public.patients (lower(last_name), lower(first_name));
create index if not exists patients_dob_idx on public.patients (date_of_birth);
create index if not exists patients_phone_idx on public.patients (phone);

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- 6. cases (one patient can have multiple cases — auto MVA, slip & fall, etc.)
-- -------------------------------------------------------------
create table if not exists public.cases (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid not null references public.patients(id) on delete cascade,

  case_number             text,                          -- internal case # (auto-generated later)
  case_type               text not null default 'mva'
                            check (case_type in ('mva', 'slip_fall', 'workers_comp', 'sports', 'other')),
  status                  text not null default 'open'
                            check (status in ('open', 'active', 'on_hold', 'settled', 'closed', 'denied')),

  date_of_injury          date,
  date_of_first_visit     date,
  description             text,

  -- Billing path
  billing_method          text not null default 'insurance'
                            check (billing_method in ('insurance', 'lop', 'cash', 'mixed')),

  -- Insurance (PIP/MedPay/3rd-party-BI)
  primary_carrier_id      uuid references public.insurance_carriers(id) on delete set null,
  primary_claim_number    text,
  primary_policy_number   text,
  primary_adjuster_name   text,
  primary_adjuster_phone  text,
  primary_adjuster_email  text,

  secondary_carrier_id    uuid references public.insurance_carriers(id) on delete set null,
  secondary_claim_number  text,
  secondary_policy_number text,

  -- Attorney (LOP path)
  attorney_id             uuid references public.attorneys(id) on delete set null,
  lop_signed              boolean not null default false,
  lop_signed_date         date,

  -- Outcome
  settled_amount          numeric(12, 2),
  settled_date            date,
  closed_reason           text,

  notes                   text,

  created_at              timestamptz not null default timezone('utc', now()),
  created_by              uuid references public.profiles(id),
  updated_at              timestamptz not null default timezone('utc', now())
);
create index if not exists cases_patient_idx on public.cases (patient_id);
create index if not exists cases_status_idx on public.cases (status);
create index if not exists cases_doi_idx on public.cases (date_of_injury);

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- 7. visits (each appointment / encounter)
-- -------------------------------------------------------------
create table if not exists public.visits (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references public.patients(id) on delete cascade,
  case_id         uuid references public.cases(id) on delete set null,
  provider_id     uuid references public.providers(id) on delete set null,

  visit_date      date not null,
  visit_time      time,
  duration_min    int,
  visit_type      text default 'office'
                   check (visit_type in ('office', 'tele', 'consult', 'eval', 'reeval', 'discharge', 'other')),
  status          text not null default 'completed'
                   check (status in ('scheduled', 'completed', 'no_show', 'cancelled', 'rescheduled')),

  chief_complaint text,
  subjective      text,
  objective       text,
  assessment      text,
  plan            text,
  notes           text,

  created_at      timestamptz not null default timezone('utc', now()),
  created_by      uuid references public.profiles(id),
  updated_at      timestamptz not null default timezone('utc', now())
);
create index if not exists visits_patient_idx on public.visits (patient_id);
create index if not exists visits_case_idx on public.visits (case_id);
create index if not exists visits_date_idx on public.visits (visit_date);

drop trigger if exists visits_set_updated_at on public.visits;
create trigger visits_set_updated_at
  before update on public.visits
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- 8. charges (line items per visit — for CMS-1500 / ledger / LOP)
-- -------------------------------------------------------------
create table if not exists public.charges (
  id              uuid primary key default gen_random_uuid(),
  visit_id        uuid not null references public.visits(id) on delete cascade,
  case_id         uuid references public.cases(id) on delete set null,
  patient_id      uuid not null references public.patients(id) on delete cascade,

  cpt_code        text references public.cpt_codes(code),
  icd_codes       text[] default '{}',          -- array of ICD-10 codes for this line
  modifier        text,
  units           int not null default 1,
  fee             numeric(10, 2) not null default 0,
  allowed         numeric(10, 2),
  paid            numeric(10, 2) not null default 0,
  adjustment      numeric(10, 2) not null default 0,
  balance         numeric(10, 2) generated always as (fee - paid - adjustment) stored,

  billed_date     date,
  paid_date       date,
  status          text not null default 'unbilled'
                   check (status in ('unbilled', 'billed', 'partial', 'paid', 'denied', 'written_off')),

  notes           text,

  created_at      timestamptz not null default timezone('utc', now()),
  created_by      uuid references public.profiles(id),
  updated_at      timestamptz not null default timezone('utc', now())
);
create index if not exists charges_visit_idx on public.charges (visit_id);
create index if not exists charges_case_idx on public.charges (case_id);
create index if not exists charges_patient_idx on public.charges (patient_id);
create index if not exists charges_status_idx on public.charges (status);

drop trigger if exists charges_set_updated_at on public.charges;
create trigger charges_set_updated_at
  before update on public.charges
  for each row execute function public.set_updated_at();

-- =============================================================
-- 9. Row Level Security
-- =============================================================
-- Default policy: any authenticated, active staff member can read/write
-- everything. We can tighten by role later. PHI access is gated by auth.
-- The `secret` key bypasses RLS for backend ops.
-- =============================================================

alter table public.profiles            enable row level security;
alter table public.insurance_carriers  enable row level security;
alter table public.attorneys           enable row level security;
alter table public.providers           enable row level security;
alter table public.cpt_codes           enable row level security;
alter table public.icd_codes           enable row level security;
alter table public.patients            enable row level security;
alter table public.cases               enable row level security;
alter table public.visits              enable row level security;
alter table public.charges             enable row level security;

-- profiles: a user can see their own + admins/managers can see all
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated using (
    id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'manager')
    )
  );

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Helper: is current user active staff?
create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true
  );
$$;

-- Generic policy template for PHI/operational tables: any active staff
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'insurance_carriers',
    'attorneys',
    'providers',
    'cpt_codes',
    'icd_codes',
    'patients',
    'cases',
    'visits',
    'charges'
  ]
  loop
    execute format('drop policy if exists %I_staff_all on public.%I;', tbl, tbl);
    execute format(
      'create policy %I_staff_all on public.%I for all to authenticated '
      || 'using (public.is_active_staff()) '
      || 'with check (public.is_active_staff());',
      tbl, tbl
    );
  end loop;
end$$;

-- =============================================================
-- 10. Promote Jay to admin (run once you know your email)
-- =============================================================
-- After signing up via the app, run something like:
--   update public.profiles set role = 'admin' where email = 'you@proinjury.com';
-- That's done manually in the SQL editor for safety.

-- =============================================================
-- DONE.
-- =============================================================
