-- =============================================================
-- Pro Injury CRM — Case attachments (insurance cards, LOP, etc.)
-- 2026-05-19 (migration 0011)
-- =============================================================
-- Simple file storage: one row per file in case_attachments.
-- File bytes live in Supabase Storage bucket 'case-files'.

-- 1. Attachment metadata table
create table if not exists public.case_attachments (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid not null references public.cases(id) on delete cascade,
  patient_id      uuid not null references public.patients(id) on delete cascade,

  kind            text not null
                   check (kind in (
                     'insurance_card_front',
                     'insurance_card_back',
                     'id_card',
                     'lop_letter',
                     'police_report',
                     'medical_record',
                     'other'
                   )),
  label           text,                            -- optional display name override
  storage_path    text not null,                   -- path inside the bucket
  mime_type       text,
  size_bytes      bigint,

  uploaded_by     uuid references public.profiles(id),
  created_at      timestamptz not null default timezone('utc', now())
);

create index if not exists case_attachments_case_idx     on public.case_attachments (case_id);
create index if not exists case_attachments_patient_idx  on public.case_attachments (patient_id);
create index if not exists case_attachments_kind_idx     on public.case_attachments (kind);

alter table public.case_attachments enable row level security;

drop policy if exists case_attachments_staff_all on public.case_attachments;
create policy case_attachments_staff_all on public.case_attachments
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- 2. Storage bucket (private — no public URLs; signed URLs only)
insert into storage.buckets (id, name, public)
values ('case-files', 'case-files', false)
on conflict (id) do nothing;

-- 3. Storage RLS: only authenticated active staff can read/write within the bucket
drop policy if exists "case-files select for staff"  on storage.objects;
drop policy if exists "case-files insert for staff"  on storage.objects;
drop policy if exists "case-files update for staff"  on storage.objects;
drop policy if exists "case-files delete for staff"  on storage.objects;

create policy "case-files select for staff" on storage.objects
  for select to authenticated
  using (bucket_id = 'case-files' and public.is_active_staff());

create policy "case-files insert for staff" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'case-files' and public.is_active_staff());

create policy "case-files update for staff" on storage.objects
  for update to authenticated
  using (bucket_id = 'case-files' and public.is_active_staff())
  with check (bucket_id = 'case-files' and public.is_active_staff());

create policy "case-files delete for staff" on storage.objects
  for delete to authenticated
  using (bucket_id = 'case-files' and public.is_active_staff());

notify pgrst, 'reload schema';
