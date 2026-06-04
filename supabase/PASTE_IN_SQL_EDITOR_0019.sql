-- Run once in Supabase → SQL Editor if fraud (or other) intake pages fail with
-- "violates foreign key constraint ... packet_id_fkey"

-- See supabase/migrations/0019_fix_intake_form_packet_fks.sql (full script)

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'patient_intake',
    'pip_disclosure',
    'assignment_benefits',
    'hipaa_consent',
    'fraud_statement',
    'financial_consent',
    'treatment_consent',
    'records_release'
  ]
  loop
    execute format(
      'alter table public.%I drop constraint if exists %I_packet_id_fkey',
      tbl,
      tbl
    );
    execute format(
      'alter table public.%I add constraint %I_packet_id_fkey foreign key (packet_id) references public.intake_packets(id) on delete cascade',
      tbl,
      tbl
    );
  end loop;
end $$;

alter table public.fraud_statement alter column fraud_signature type text;
alter table public.hipaa_consent alter column patient_signature type text;
alter table public.hipaa_consent alter column guardian_signature type text;
alter table public.hipaa_consent alter column witness_signature type text;
alter table public.assignment_benefits alter column patient_signature type text;
alter table public.financial_consent alter column financial_signature type text;
alter table public.treatment_consent alter column treatment_signature type text;
alter table public.records_release alter column records_signature type text;
alter table public.records_release alter column witness_signature type text;

notify pgrst, 'reload schema';
