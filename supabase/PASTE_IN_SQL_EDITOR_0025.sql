-- Copy everything below into Supabase SQL Editor and run once.
-- Sets the follow-up NP consultation rate to $350 (code 99214).

insert into public.cpt_codes (code, description, default_fee, is_active, category) values
  ('99214', 'Office/outpatient visit, established, 30-39 min (moderate)', 350.00, true, 'em')
on conflict (code) do update set default_fee = 350.00, is_active = true;

notify pgrst, 'reload schema';
