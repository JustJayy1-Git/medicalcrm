-- Nurse practitioner / medical doctor portal (post-intake consultation)

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in (
    'admin', 'manager', 'staff', 'billing', 'readonly', 'kiosk', 'clinical'
  ));

create table if not exists public.clinical_consultations (
  id                    uuid primary key default gen_random_uuid(),
  case_id               uuid not null references public.cases(id) on delete cascade,
  patient_id            uuid not null references public.patients(id) on delete cascade,
  intake_packet_id      bigint references public.intake_packets(id) on delete set null,
  assigned_provider_id  uuid references public.providers(id) on delete set null,
  status                text not null default 'pending'
                        check (status in ('pending', 'in_progress', 'completed')),
  nofa_json             jsonb not null default '{}'::jsonb,
  emc_json              jsonb not null default '{}'::jsonb,
  initial_report_json   jsonb not null default '{}'::jsonb,
  nofa_completed_at     timestamptz,
  emc_completed_at      timestamptz,
  initial_report_completed_at timestamptz,
  completed_at          timestamptz,
  created_at            timestamptz not null default timezone('utc', now()),
  updated_at            timestamptz not null default timezone('utc', now()),
  unique (case_id)
);

create index if not exists idx_clinical_consultations_status
  on public.clinical_consultations (status, created_at desc);

create index if not exists idx_clinical_consultations_patient
  on public.clinical_consultations (patient_id);

drop trigger if exists clinical_consultations_set_updated_at on public.clinical_consultations;
create trigger clinical_consultations_set_updated_at
  before update on public.clinical_consultations
  for each row execute function public.set_updated_at();

alter table public.clinical_consultations enable row level security;

drop policy if exists clinical_consultations_staff_all on public.clinical_consultations;
create policy clinical_consultations_staff_all on public.clinical_consultations
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

drop policy if exists clinical_consultations_clinical_rw on public.clinical_consultations;
create policy clinical_consultations_clinical_rw on public.clinical_consultations
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'clinical' and p.is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'clinical' and p.is_active = true
    )
  );

-- Reset firm-wide case counter (admin tool)
create or replace function public.reset_case_seq_gen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform setval('public.case_seq_gen', 1, false);
end;
$$;

revoke all on function public.reset_case_seq_gen() from public;
grant execute on function public.reset_case_seq_gen() to service_role;
