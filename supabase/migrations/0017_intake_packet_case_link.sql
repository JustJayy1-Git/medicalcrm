-- Link completed intake packets to the CRM case created from portal Finish.

alter table public.intake_packets
  add column if not exists case_id uuid references public.cases(id) on delete set null;

create index if not exists idx_intake_packets_case on public.intake_packets (case_id);
