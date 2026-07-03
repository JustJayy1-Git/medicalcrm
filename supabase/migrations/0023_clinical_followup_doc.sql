-- Follow-up visit document (SOAP note) on clinical consultations.

alter table public.clinical_consultations
  add column if not exists followup_json jsonb not null default '{}'::jsonb;

alter table public.clinical_consultations
  add column if not exists followup_completed_at timestamptz;
