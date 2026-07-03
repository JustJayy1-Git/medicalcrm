-- Copy everything below into Supabase SQL Editor and run once.
-- Adds the 'therapist' role plus therapy_consents / therapy_sessions tables
-- for the massage-therapist iPad portal (/therapy).

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in (
    'admin', 'manager', 'staff', 'billing', 'readonly', 'kiosk', 'clinical', 'therapist'
  ));

create table if not exists public.therapy_consents (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references public.cases(id) on delete cascade,
  patient_id    uuid not null references public.patients(id) on delete cascade,
  consent_json  jsonb not null default '{}'::jsonb,
  signed_at     timestamptz,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now()),
  unique (case_id)
);

create table if not exists public.therapy_sessions (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references public.cases(id) on delete cascade,
  patient_id    uuid not null references public.patients(id) on delete cascade,
  session_date  date not null default (timezone('utc', now()))::date,
  session_json  jsonb not null default '{}'::jsonb,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

create index if not exists idx_therapy_sessions_case_date
  on public.therapy_sessions (case_id, session_date desc);

create index if not exists idx_therapy_sessions_patient
  on public.therapy_sessions (patient_id);

drop trigger if exists therapy_consents_set_updated_at on public.therapy_consents;
create trigger therapy_consents_set_updated_at
  before update on public.therapy_consents
  for each row execute function public.set_updated_at();

drop trigger if exists therapy_sessions_set_updated_at on public.therapy_sessions;
create trigger therapy_sessions_set_updated_at
  before update on public.therapy_sessions
  for each row execute function public.set_updated_at();

alter table public.therapy_consents enable row level security;
alter table public.therapy_sessions enable row level security;

drop policy if exists therapy_consents_staff_all on public.therapy_consents;
create policy therapy_consents_staff_all on public.therapy_consents
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

drop policy if exists therapy_consents_therapist_rw on public.therapy_consents;
create policy therapy_consents_therapist_rw on public.therapy_consents
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'therapist' and p.is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'therapist' and p.is_active = true
    )
  );

drop policy if exists therapy_sessions_staff_all on public.therapy_sessions;
create policy therapy_sessions_staff_all on public.therapy_sessions
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

drop policy if exists therapy_sessions_therapist_rw on public.therapy_sessions;
create policy therapy_sessions_therapist_rw on public.therapy_sessions
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'therapist' and p.is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'therapist' and p.is_active = true
    )
  );

notify pgrst, 'reload schema';
