export const TEMPLATE_SELECT =
  "id, name, description, category, file_name, mime_type, size_bytes, sort_rank, is_active, created_at" as const;

export type DocumentTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | null;
  sort_rank: number;
  is_active: boolean;
  created_at: string;
};

export const TEMPLATE_CATEGORIES = [
  { value: "patient_file", label: "Patient physical file" },
  { value: "letters", label: "Letters and correspondence" },
  { value: "billing", label: "Billing and claims" },
  { value: "legal", label: "Legal and LOP" },
  { value: "admin", label: "Office admin" },
  { value: "other", label: "Other" },
] as const;

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  TEMPLATE_CATEGORIES.map((c) => [c.value, c.label]),
);
