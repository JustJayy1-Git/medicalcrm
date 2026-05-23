/** Attachment kinds stored in `case_attachments` / `case-files` bucket. */
export const ATTACHMENT_KINDS = [
  "intake_packet",
  "insurance_card_front",
  "insurance_card_back",
  "id_card",
  "lop_letter",
  "police_report",
  "medical_record",
  "other",
] as const;

export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const ATTACHMENT_KIND_LABEL: Record<AttachmentKind, string> = {
  intake_packet: "Intake forms (compiled)",
  insurance_card_front: "Insurance card (front)",
  insurance_card_back: "Insurance card (back)",
  id_card: "Driver's license / ID",
  lop_letter: "LOP letter",
  police_report: "Police report",
  medical_record: "Medical record",
  other: "Other document",
};

export function isAttachmentKind(value: string): value is AttachmentKind {
  return (ATTACHMENT_KINDS as readonly string[]).includes(value);
}
