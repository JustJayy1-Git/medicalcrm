-- =============================================================
-- Pro Injury CRM — Office document templates (PDF library)
-- 2026-05-19 (migration 0013)
-- =============================================================
-- Run in Supabase SQL Editor. PDFs live in bucket office-templates.

create table if not exists public.document_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  category        text not null default 'patient_file'
                    check (category in (
                      'patient_file',
                      'letters',
                      'billing',
                      'legal',
                      'admin',
                      'other'
                    )),
  file_name       text not null,
  storage_path    text not null,
  mime_type       text not null default 'application/pdf',
  size_bytes      bigint,
  sort_rank       int not null default 100,
  is_active       boolean not null default true,
  uploaded_by     uuid references public.profiles(id),
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index if not exists document_templates_category_idx
  on public.document_templates (category, sort_rank, name);

drop trigger if exists document_templates_set_updated_at on public.document_templates;
create trigger document_templates_set_updated_at
  before update on public.document_templates
  for each row execute function public.set_updated_at();

alter table public.document_templates enable row level security;

drop policy if exists document_templates_staff_all on public.document_templates;
create policy document_templates_staff_all on public.document_templates
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

insert into storage.buckets (id, name, public)
values ('office-templates', 'office-templates', false)
on conflict (id) do nothing;

drop policy if exists "office-templates select for staff" on storage.objects;
drop policy if exists "office-templates insert for staff" on storage.objects;
drop policy if exists "office-templates update for staff" on storage.objects;
drop policy if exists "office-templates delete for staff" on storage.objects;

create policy "office-templates select for staff" on storage.objects
  for select to authenticated
  using (bucket_id = 'office-templates' and public.is_active_staff());

create policy "office-templates insert for staff" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'office-templates' and public.is_active_staff());

create policy "office-templates update for staff" on storage.objects
  for update to authenticated
  using (bucket_id = 'office-templates' and public.is_active_staff())
  with check (bucket_id = 'office-templates' and public.is_active_staff());

create policy "office-templates delete for staff" on storage.objects
  for delete to authenticated
  using (bucket_id = 'office-templates' and public.is_active_staff());

notify pgrst, 'reload schema';
