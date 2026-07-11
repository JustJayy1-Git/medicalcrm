-- Follow-up NP consultation billed at $350 (practice rate).
-- Code assumed 99214 (established patient follow-up) — confirm against the
-- practice's HICFA; swap the code here and in src/lib/clinical/billing.ts
-- if the paper claim uses a different E/M code.

insert into public.cpt_codes (code, description, default_fee, is_active, category) values
  ('99214', 'Office/outpatient visit, established, 30-39 min (moderate)', 350.00, true, 'em')
on conflict (code) do update set default_fee = 350.00, is_active = true;
