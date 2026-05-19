-- =============================================================
-- Pro Injury CRM — Florida common auto carriers (curated seed)
-- 2026-05-19 (migration 0012)
-- =============================================================

alter table public.insurance_carriers
  add column if not exists seed_key text,
  add column if not exists sort_rank int not null default 100;

drop index if exists insurance_carriers_seed_key_idx;

-- Dedupe seed_key rows if a prior partial run created duplicates
delete from public.insurance_carriers a
using public.insurance_carriers b
where a.id > b.id
  and a.seed_key is not null
  and a.seed_key = b.seed_key;

alter table public.insurance_carriers
  drop constraint if exists insurance_carriers_seed_key_unique;

alter table public.insurance_carriers
  add constraint insurance_carriers_seed_key_unique unique (seed_key);

update public.insurance_carriers set seed_key = 'geico', sort_rank = 2
  where seed_key is null and lower(name) = 'geico';
update public.insurance_carriers set seed_key = 'state_farm', sort_rank = 1
  where seed_key is null and lower(name) = 'state farm';
update public.insurance_carriers set seed_key = 'progressive', sort_rank = 3
  where seed_key is null and lower(name) = 'progressive';
update public.insurance_carriers set seed_key = 'allstate', sort_rank = 4
  where seed_key is null and lower(name) = 'allstate';
update public.insurance_carriers set seed_key = 'usaa', sort_rank = 5
  where seed_key is null and lower(name) = 'usaa';
update public.insurance_carriers set seed_key = 'liberty_mutual', sort_rank = 6
  where seed_key is null and lower(name) = 'liberty mutual';
update public.insurance_carriers set seed_key = 'nationwide', sort_rank = 7
  where seed_key is null and lower(name) = 'nationwide';
update public.insurance_carriers set seed_key = 'farmers', sort_rank = 8
  where seed_key is null and lower(name) = 'farmers';
update public.insurance_carriers set seed_key = 'travelers', sort_rank = 9
  where seed_key is null and lower(name) = 'travelers';
update public.insurance_carriers set seed_key = 'infinity', sort_rank = 10
  where seed_key is null and lower(name) = 'infinity insurance';
update public.insurance_carriers set seed_key = 'united_auto', sort_rank = 11
  where seed_key is null and name ilike 'United Auto Insurance%';
update public.insurance_carriers set seed_key = 'ocean_harbor', sort_rank = 12
  where seed_key is null and lower(name) = 'ocean harbor casualty';
update public.insurance_carriers set seed_key = 'bristol_west', sort_rank = 13
  where seed_key is null and lower(name) = 'bristol west';
update public.insurance_carriers set seed_key = 'mercury', sort_rank = 14
  where seed_key is null and lower(name) = 'mercury insurance';
update public.insurance_carriers set seed_key = 'direct_auto', sort_rank = 15
  where seed_key is null and lower(name) = 'direct auto';

insert into public.insurance_carriers
  (seed_key, sort_rank, name, carrier_type, payer_id, phone, fax, email,
   address_line1, address_line2, city, state, zip, notes)
values
  ('state_farm', 1, 'State Farm', 'auto', '43420', '1-800-732-5246', null, null, 'PO Box 106110', null, 'Atlanta', 'GA', '30348', 'PIP MedPay claims'),
  ('geico', 2, 'GEICO', 'auto', '36259', '1-800-841-3000', null, null, 'One GEICO Plaza', null, 'Washington', 'DC', '20076', 'PIP claims'),
  ('progressive', 3, 'Progressive', 'auto', '24260', '1-800-274-4499', null, null, 'PO Box 94739', null, 'Cleveland', 'OH', '44101', null),
  ('allstate', 4, 'Allstate', 'auto', '37907', '1-800-255-7828', null, null, 'PO Box 660636', null, 'Dallas', 'TX', '75266', null),
  ('usaa', 5, 'USAA', 'auto', '94776', '1-800-531-8722', null, null, '9800 Fredericksburg Rd', null, 'San Antonio', 'TX', '78288', null),
  ('liberty_mutual', 6, 'Liberty Mutual', 'auto', '23043', '1-800-225-2467', null, null, 'PO Box 515097', null, 'Los Angeles', 'CA', '90051', null),
  ('nationwide', 7, 'Nationwide', 'auto', '23396', '1-800-421-3535', null, null, 'PO Box 742522', null, 'Cincinnati', 'OH', '45274', null),
  ('farmers', 8, 'Farmers Insurance', 'auto', '21652', '1-800-435-7764', null, null, 'PO Box 268994', null, 'Oklahoma City', 'OK', '73126', null),
  ('travelers', 9, 'Travelers', 'auto', '25658', '1-800-252-4633', null, null, 'PO Box 660307', null, 'Dallas', 'TX', '75266', null),
  ('infinity', 10, 'Infinity Insurance', 'auto', '52041', '1-800-204-7140', null, null, 'PO Box 685004', null, 'Birmingham', 'AL', '35268', 'FL non-standard'),
  ('united_auto', 11, 'United Auto Insurance (UAIC)', 'auto', '52073', '1-800-487-4189', null, null, '1313 NW 167th Street', null, 'Miami Gardens', 'FL', '33169', 'South FL'),
  ('ocean_harbor', 12, 'Ocean Harbor Casualty', 'auto', '11199', '1-800-226-0260', null, null, 'PO Box 023535', null, 'Miami', 'FL', '33102', 'FL non-standard'),
  ('bristol_west', 13, 'Bristol West', 'auto', '36447', '1-800-274-7865', null, null, 'PO Box 4500', null, 'Winston-Salem', 'NC', '27115', null),
  ('mercury', 14, 'Mercury Insurance', 'auto', '23663', '1-800-503-3724', null, null, 'PO Box 11991', null, 'Santa Ana', 'CA', '92711', null),
  ('direct_auto', 15, 'Direct Auto', 'auto', null, '1-877-468-3466', null, null, 'PO Box 24050', null, 'Nashville', 'TN', '37202', null)
on conflict (seed_key) do update set
  sort_rank = excluded.sort_rank,
  name = excluded.name,
  carrier_type = excluded.carrier_type,
  payer_id = excluded.payer_id,
  phone = excluded.phone,
  fax = excluded.fax,
  email = excluded.email,
  address_line1 = excluded.address_line1,
  address_line2 = excluded.address_line2,
  city = excluded.city,
  state = excluded.state,
  zip = excluded.zip,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

notify pgrst, 'reload schema';
