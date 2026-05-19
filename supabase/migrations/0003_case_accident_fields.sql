-- =============================================================
-- Pro Injury CRM — Case accident & pain detail fields
-- 2026-05-18 (migration 0003)
-- =============================================================
-- Adds the accident dynamics + pain/symptom fields used during
-- PI case intake (police report data + initial pain inventory).

alter table public.cases
  add column if not exists how_it_happened   text,
  add column if not exists fault              text,            -- 'patient', 'other_driver', 'shared', 'unclear'
  add column if not exists fault_notes        text,
  add column if not exists pain_locations     text[] default '{}',  -- e.g. {neck, lower_back, left_shoulder}
  add column if not exists pain_level         int check (pain_level between 0 and 10),
  add column if not exists pain_notes         text,
  add column if not exists loss_consciousness boolean default false,
  add column if not exists airbag_deployed    boolean,
  add column if not exists seatbelt_worn      boolean,
  add column if not exists police_report_num  text,
  add column if not exists er_visit           boolean default false,
  add column if not exists er_visit_facility  text,
  add column if not exists er_visit_date      date,
  add column if not exists ambulance          boolean default false;

create index if not exists cases_fault_idx on public.cases (fault);
