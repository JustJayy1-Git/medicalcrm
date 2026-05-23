-- Attorney fields on page-1 patient intake (iPad portal)
alter table public.patient_intake
  add column if not exists attorney_firm  text,
  add column if not exists attorney_name  text,
  add column if not exists attorney_phone text,
  add column if not exists attorney_email text;
