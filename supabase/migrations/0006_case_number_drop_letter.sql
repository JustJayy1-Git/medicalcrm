-- =============================================================
-- Pro Injury CRM — Drop case letter, use global seq only
-- 2026-05-18 (migration 0006)
-- =============================================================

create or replace function public.assign_case_number()
returns trigger
language plpgsql
as $$
begin
  if new.case_seq is null then
    new.case_seq := nextval('public.case_seq_gen');
  end if;

  -- Letter is no longer assigned; clear if set on insert
  new.case_letter := null;

  -- Build display string only if not provided
  if new.case_number is null or new.case_number = '' then
    new.case_number := new.case_seq::text;
  end if;

  return new;
end;
$$;

-- Strip letters and re-format existing rows
update public.cases
   set case_letter = null,
       case_number = case_seq::text
 where case_seq is not null;
