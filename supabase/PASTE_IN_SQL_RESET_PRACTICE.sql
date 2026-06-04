-- Admin: remove iPad / John Doe practice data and reset the next case number to 1.
-- Run in Supabase → SQL Editor (copy all SQL below, not this file path).

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

-- Delete test patients (cascades cases, visits, intake packets, etc.)
delete from public.patients
where (
  (lower(trim(first_name)) = 'intake' and lower(trim(last_name)) like 'pending%')
  or (lower(trim(first_name)) = 'john' and lower(trim(last_name)) like 'doe%')
);

-- Delete orphan portal test cases
delete from public.cases
where lower(trim(coalesce(description, ''))) in (
  'portal intake in progress',
  'portal intake',
  'ipad intake test'
);

select public.reset_case_seq_gen();

notify pgrst, 'reload schema';
