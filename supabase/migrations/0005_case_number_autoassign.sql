-- =============================================================
-- Pro Injury CRM — Auto-assign case numbers
-- 2026-05-18 (migration 0005)
-- =============================================================
-- Format: <global_seq>-<per_patient_letter>
--   e.g. 247-A  = the 247th case in the firm, patient's 1st case
--        248-B  = the 248th case in the firm, that patient's 2nd case
--
-- Stores the two pieces separately so we can sort/filter cleanly.

alter table public.cases
  add column if not exists case_seq        int,         -- global firm-wide
  add column if not exists case_letter     text;        -- 'A', 'B', ...

create sequence if not exists public.case_seq_gen start 1;

create or replace function public.assign_case_number()
returns trigger
language plpgsql
as $$
declare
  next_seq    int;
  used_letters text[];
  candidate   text;
  letters     text[] := array[
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
  ];
  l           text;
begin
  -- Global sequence
  if new.case_seq is null then
    new.case_seq := nextval('public.case_seq_gen');
  end if;

  -- Per-patient letter (pick next available)
  if new.case_letter is null then
    select coalesce(array_agg(case_letter), '{}')
      into used_letters
      from public.cases
      where patient_id = new.patient_id
        and case_letter is not null;

    candidate := null;
    foreach l in array letters loop
      if not (l = any(used_letters)) then
        candidate := l;
        exit;
      end if;
    end loop;

    -- More than 26 cases on one patient? Fall back to AA, AB, ...
    if candidate is null then
      candidate := 'AA';
      while candidate = any(used_letters) loop
        candidate := chr(ascii(substr(candidate,1,1))) ||
                     chr(ascii(substr(candidate,2,1)) + 1);
      end loop;
    end if;

    new.case_letter := candidate;
  end if;

  -- Build the display string only if not provided
  if new.case_number is null or new.case_number = '' then
    new.case_number := new.case_seq::text || '-' || new.case_letter;
  end if;

  return new;
end;
$$;

drop trigger if exists cases_assign_number on public.cases;
create trigger cases_assign_number
  before insert on public.cases
  for each row execute function public.assign_case_number();

-- Backfill any existing rows that don't have these columns populated
do $$
declare
  r          record;
  next_seq   int;
  used       text[];
  letters    text[] := array['A','B','C','D','E','F','G','H','I','J','K','L','M',
                             'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  l          text;
  cand       text;
begin
  for r in
    select id, patient_id
      from public.cases
      where case_seq is null
      order by created_at, id
  loop
    next_seq := nextval('public.case_seq_gen');

    select coalesce(array_agg(case_letter), '{}')
      into used
      from public.cases
      where patient_id = r.patient_id
        and case_letter is not null;

    cand := null;
    foreach l in array letters loop
      if not (l = any(used)) then
        cand := l;
        exit;
      end if;
    end loop;

    update public.cases
      set case_seq    = next_seq,
          case_letter = coalesce(cand, 'A'),
          case_number = next_seq::text || '-' || coalesce(cand, 'A')
      where id = r.id;
  end loop;
end$$;
