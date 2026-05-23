-- Allow compiled intake packet files in case attachments
alter table public.case_attachments drop constraint if exists case_attachments_kind_check;

alter table public.case_attachments add constraint case_attachments_kind_check
  check (kind in (
    'intake_packet',
    'insurance_card_front',
    'insurance_card_back',
    'id_card',
    'lop_letter',
    'police_report',
    'medical_record',
    'other'
  ));

notify pgrst, 'reload schema';
