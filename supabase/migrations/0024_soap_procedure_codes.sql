-- Seed the remaining Therapy SOAP Note procedure codes so auto-billing can
-- reference them. Fees default to 0.00 where the practice has not provided
-- a rate yet — set real fees before billing those codes.

insert into public.cpt_codes (code, description, default_fee, is_active, category) values
  ('97034', 'Contrast bath therapy, each 15 min',                 0.00, true, 'modality'),
  ('97039', 'Unlisted modality (Hydrotherapy)',                   0.00, true, 'modality'),
  ('97018', 'Paraffin bath therapy',                              0.00, true, 'modality'),
  ('97530', 'Therapeutic activities, each 15 min',                0.00, true, 'therapy'),
  ('97116', 'Gait training therapy, each 15 min',                 0.00, true, 'therapy'),
  ('97124', 'Massage therapy, each 15 min',                       0.00, true, 'therapy'),
  ('97535', 'Self-care/home management training, each 15 min',    0.00, true, 'therapy'),
  ('97025', 'Infrared therapy',                                   0.00, true, 'modality'),
  ('97022', 'Whirlpool therapy',                                  0.00, true, 'modality'),
  ('97010', 'Hot or cold pack application',                       0.00, true, 'modality'),
  ('E0730', 'TENS unit, four or more leads',                      0.00, true, 'supply'),
  ('E0230', 'Ice cap or collar (Flexi-Pack)',                     0.00, true, 'supply'),
  ('S8943', 'Low-level laser therapy',                            0.00, true, 'modality'),
  ('99211', 'Office visit, established patient, minimal',         0.00, true, 'em')
on conflict (code) do nothing;
