-- =============================================================
-- Pro Injury CRM — Add supervising provider on cases
-- 2026-05-19 (migration 0007)
-- =============================================================

alter table public.cases
  add column if not exists supervising_provider_id uuid
    references public.providers(id) on delete set null;

create index if not exists cases_supervising_provider_idx
  on public.cases (supervising_provider_id);
