-- Run once in Supabase → SQL Editor (fixes iPad intake page 1 attorney fields)
-- Migration: 0018_intake_attorney_fields.sql

alter table public.patient_intake
  add column if not exists attorney_firm  text,
  add column if not exists attorney_name  text,
  add column if not exists attorney_phone text,
  add column if not exists attorney_email text;

-- Refresh PostgREST schema cache (Supabase usually picks this up within seconds)
notify pgrst, 'reload schema';
