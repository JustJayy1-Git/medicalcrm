-- Follow-up visits: send a treating patient back into the NP queue.

alter table public.clinical_consultations
  add column if not exists visit_kind text not null default 'initial';

alter table public.clinical_consultations
  drop constraint if exists clinical_consultations_visit_kind_check;
alter table public.clinical_consultations
  add constraint clinical_consultations_visit_kind_check
  check (visit_kind in ('initial', 'follow_up'));

alter table public.clinical_consultations
  add column if not exists followup_requested_at timestamptz;
