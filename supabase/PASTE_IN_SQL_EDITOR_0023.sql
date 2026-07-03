-- Copy everything below into Supabase SQL Editor and run once.
-- Adds the follow-up visit document (SOAP note) to clinical consultations.

alter table public.clinical_consultations
  add column if not exists followup_json jsonb not null default '{}'::jsonb;

alter table public.clinical_consultations
  add column if not exists followup_completed_at timestamptz;

notify pgrst, 'reload schema';
