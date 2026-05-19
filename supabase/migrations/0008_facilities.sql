-- =============================================================
-- Pro Injury CRM — Facilities (your own clinic locations)
-- 2026-05-19 (migration 0008)
-- =============================================================

create table if not exists public.facilities (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  zip             text,
  phone           text,
  fax             text,
  npi             text,
  tax_id          text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index if not exists facilities_name_idx on public.facilities (lower(name));

drop trigger if exists facilities_set_updated_at on public.facilities;
create trigger facilities_set_updated_at
  before update on public.facilities
  for each row execute function public.set_updated_at();

alter table public.facilities enable row level security;
drop policy if exists facilities_staff_all on public.facilities;
create policy facilities_staff_all on public.facilities
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- Replace free-text facility on cases with FK
alter table public.cases
  add column if not exists facility_id uuid references public.facilities(id) on delete set null;

create index if not exists cases_facility_idx on public.cases (facility_id);

-- Seed two common Pro Injury facilities (idempotent)
insert into public.facilities (name)
values
  ('Pro Injury — Main Office'),
  ('Pro Injury — Miami Lakes')
on conflict do nothing;
