-- =============================================================
-- Pro Injury CRM — Patient intake expansion to match Medisoft
-- 2026-05-18 (migration 0002)
-- =============================================================
-- Adds all the fields visible on the Medisoft "Name, Address" and
-- "Other Information" tabs. Run after 0001_init.sql.

-- -------------------------------------------------------------
-- 1. Extend patients table
-- -------------------------------------------------------------

alter table public.patients
  -- Identity / chart
  add column if not exists chart_number     text unique,
  add column if not exists suffix           text,
  add column if not exists ar_status        text,
  add column if not exists is_inactive      boolean not null default false,

  -- Address extras
  add column if not exists country          text default 'USA',

  -- Phones
  add column if not exists phone_home       text,
  add column if not exists phone_work       text,
  add column if not exists phone_cell       text,
  add column if not exists phone_fax        text,
  add column if not exists phone_other      text,

  -- Previous name + address (Medisoft block)
  add column if not exists prev_last_name     text,
  add column if not exists prev_first_name    text,
  add column if not exists prev_middle_name   text,
  add column if not exists prev_suffix        text,
  add column if not exists prev_address_line1 text,
  add column if not exists prev_address_line2 text,
  add column if not exists prev_city          text,
  add column if not exists prev_state         text,
  add column if not exists prev_zip           text,
  add column if not exists prev_country       text,

  -- Demographics
  add column if not exists birth_weight       text,
  add column if not exists ssn_full           text,            -- consider encryption/pgcrypto later
  add column if not exists ethnicity          text,
  add column if not exists units              text,
  add column if not exists entity_type        text,
  add column if not exists death_date         date,

  -- Sex/gender expansion (replaces simple sex)
  add column if not exists birth_sex          text,
  add column if not exists sexual_orientation text,
  add column if not exists gender_identity    text,

  -- Race (booleans per OMB / Medisoft list)
  add column if not exists race_native_american  boolean not null default false,
  add column if not exists race_asian            boolean not null default false,
  add column if not exists race_black            boolean not null default false,
  add column if not exists race_pacific_islander boolean not null default false,
  add column if not exists race_white            boolean not null default false,
  add column if not exists race_other            boolean not null default false,
  add column if not exists race_declined         boolean not null default false,

  -- Other Information tab
  add column if not exists patient_type            text default 'patient',     -- patient/guarantor
  add column if not exists assigned_provider_id    uuid references public.providers(id) on delete set null,
  add column if not exists patient_id_2            text,
  add column if not exists patient_billing_code    text,
  add column if not exists patient_indicator       text,
  add column if not exists healthcare_id           text,
  add column if not exists medical_record_number   text,
  add column if not exists signature_on_file       boolean not null default false,
  add column if not exists signature_date          date,

  -- Default employer block
  add column if not exists employer_name           text,
  add column if not exists employment_status       text,
  add column if not exists employer_phone          text,
  add column if not exists employer_phone_ext      text,
  add column if not exists employer_location       text,
  add column if not exists retirement_date         date,

  -- Patient portal
  add column if not exists web_enabled             boolean not null default false,
  add column if not exists appointments_allowed    int;

-- chart_number search
create index if not exists patients_chart_number_idx on public.patients (chart_number);
create index if not exists patients_assigned_provider_idx on public.patients (assigned_provider_id);

-- -------------------------------------------------------------
-- 2. Auto chart number assignment (Medisoft behavior:
--    "If the Chart Number is left blank, the program will assign one.")
-- -------------------------------------------------------------

-- Strategy: Use first 5 letters of last name (UPPER) + first letter of first
-- name + zero-padded sequence (e.g. SMITHJ001). Collisions get a fresh seq.
create sequence if not exists public.patient_chart_seq start 1;

create or replace function public.assign_chart_number()
returns trigger
language plpgsql
as $$
declare
  base   text;
  seq    int;
  candidate text;
begin
  if new.chart_number is not null and new.chart_number <> '' then
    return new;
  end if;

  base := upper(
    regexp_replace(left(coalesce(new.last_name, 'X'), 5), '[^A-Za-z]', '', 'g')
    || left(coalesce(new.first_name, 'X'), 1)
  );

  -- pick next free 3-digit suffix
  for i in 1..999 loop
    seq := nextval('public.patient_chart_seq');
    candidate := base || lpad((seq % 1000)::text, 3, '0');
    exit when not exists (
      select 1 from public.patients where chart_number = candidate
    );
  end loop;

  new.chart_number := candidate;
  return new;
end;
$$;

drop trigger if exists patients_assign_chart on public.patients;
create trigger patients_assign_chart
  before insert on public.patients
  for each row execute function public.assign_chart_number();

-- =============================================================
-- DONE.
-- =============================================================
