-- =============================================================
-- Pro Injury CRM — Seed major auto insurance carriers
-- 2026-05-19 (migration 0010)
-- =============================================================
-- Targets FL-relevant carriers (Miami Lakes practice) + national.
-- Contact info is claims department where known. Verify and edit
-- under Lists → Insurance carriers after seeding.

insert into public.insurance_carriers
  (name, carrier_type, payer_id, phone, fax,
   address_line1, city, state, zip, notes)
values
  -- National majors
  ('GEICO',                'auto', '36259', '1-800-841-3000',  NULL,
   'One GEICO Plaza',                  'Washington',   'DC', '20076',
   'PIP/MedPay claims dept; verify payer ID for your clearinghouse.'),
  ('State Farm',           'auto', '43420', '1-800-732-5246',  NULL,
   'PO Box 106110',                    'Atlanta',      'GA', '30348',
   'State Farm Mutual Automobile Insurance Company.'),
  ('Progressive',          'auto', '24260', '1-800-274-4499',  NULL,
   'PO Box 94739',                     'Cleveland',    'OH', '44101',
   'Progressive Casualty / American / Select.'),
  ('Allstate',             'auto', '37907', '1-800-255-7828',  NULL,
   'PO Box 660636',                    'Dallas',       'TX', '75266',
   'Allstate Fire & Casualty / Property & Casualty.'),
  ('Liberty Mutual',       'auto', '23043', '1-800-225-2467',  NULL,
   'PO Box 515097',                    'Los Angeles',  'CA', '90051',
   'Liberty Mutual / Safeco family.'),
  ('USAA',                 'auto', '94776', '1-800-531-8722',  NULL,
   '9800 Fredericksburg Rd',           'San Antonio',  'TX', '78288',
   'USAA — military families only.'),
  ('Nationwide',           'auto', '23396', '1-800-421-3535',  NULL,
   'PO Box 742522',                    'Cincinnati',   'OH', '45274',
   'Nationwide Mutual / Affinity / Allied.'),
  ('Farmers',              'auto', '21652', '1-800-435-7764',  NULL,
   'PO Box 268994',                    'Oklahoma City','OK', '73126',
   'Farmers Insurance Exchange.'),
  ('Travelers',            'auto', '25658', '1-800-252-4633',  NULL,
   'PO Box 660307',                    'Dallas',       'TX', '75266',
   'Travelers Indemnity Company.'),
  ('Esurance',             'auto', '25178', '1-800-378-7262',  NULL,
   'PO Box 5022',                      'Rocklin',      'CA', '95677',
   'Esurance (Allstate subsidiary).'),
  ('Mercury Insurance',    'auto', '23663', '1-800-503-3724',  NULL,
   'PO Box 11991',                     'Santa Ana',    'CA', '92711',
   'Mercury General / Mercury Indemnity.'),
  ('The General',          'auto', '24171', '1-800-280-1466',  NULL,
   'PO Box 305103',                    'Nashville',    'TN', '37230',
   'PGC / The General Automobile Insurance.'),
  ('Direct Auto',          'auto', NULL,    '1-877-468-3466',  NULL,
   'PO Box 24050',                     'Nashville',    'TN', '37202',
   'Direct General Insurance.'),

  -- Florida-heavy non-standard market
  ('Infinity Insurance',   'auto', '52041', '1-800-204-7140',  NULL,
   'PO Box 685004',                    'Birmingham',   'AL', '35268',
   'Infinity Auto Insurance — huge in FL non-standard.'),
  ('United Auto Insurance (UAIC)', 'auto', '52073', '1-800-487-4189', NULL,
   '1313 NW 167th Street',             'Miami Gardens','FL', '33169',
   'United Automobile Insurance Company — major in South FL.'),
  ('Ocean Harbor Casualty','auto', '11199', '1-800-226-0260',  NULL,
   'PO Box 023535',                    'Miami',        'FL', '33102',
   'Ocean Harbor (Pearl Holding Group) — FL non-standard.'),
  ('Windhaven Insurance',  'auto', NULL,    '1-877-808-7800',  NULL,
   'PO Box 528129',                    'Miami',        'FL', '33152',
   'Windhaven — FL non-standard (may be in receivership; verify).'),
  ('Bristol West',         'auto', '36447', '1-800-274-7865',  NULL,
   'PO Box 4500',                      'Winston-Salem','NC', '27115',
   'Bristol West (Farmers subsidiary) — FL non-standard.'),
  ('Responsive Auto',      'auto', NULL,    '1-877-880-1968',  NULL,
   'PO Box 19063',                     'Plantation',   'FL', '33318',
   'Responsive Auto Insurance Company — FL.'),
  ('Star Casualty',        'auto', NULL,    '1-305-715-1100',  NULL,
   '4651 Sheridan St',                 'Hollywood',    'FL', '33021',
   'Star Casualty Insurance — FL.'),

  -- Common health/PIP-bridge carriers (rare but happens)
  ('Florida Blue (BCBS FL)','health','00590','1-800-352-2583',  NULL,
   'PO Box 660299',                    'Dallas',       'TX', '75266',
   'Blue Cross Blue Shield of Florida.'),
  ('UnitedHealthcare',     'health','87726', '1-877-842-3210',  NULL,
   'PO Box 740800',                    'Atlanta',      'GA', '30374',
   'UHC commercial.'),
  ('Aetna',                'health','60054', '1-800-872-3862',  NULL,
   'PO Box 14079',                     'Lexington',    'KY', '40512',
   'Aetna commercial.'),
  ('Cigna',                'health','62308', '1-800-244-6224',  NULL,
   'PO Box 188061',                    'Chattanooga',  'TN', '37422',
   'Cigna commercial.')
on conflict do nothing;

notify pgrst, 'reload schema';
