export type AttorneyPicker = {
  id: string;
  attorney_name: string;
  firm_name?: string | null;
  phone?: string | null;
};

export const ATTORNEY_PICKER_SELECT = "id, attorney_name, firm_name, phone";
