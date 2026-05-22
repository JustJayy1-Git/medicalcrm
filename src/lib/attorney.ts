export type AttorneyPicker = {
  id: string;
  attorney_name: string;
  firm_name?: string | null;
  phone?: string | null;
};

export type AttorneyListRow = AttorneyPicker & {
  email?: string | null;
  city?: string | null;
  state?: string | null;
};

export const ATTORNEY_PICKER_SELECT = "id, attorney_name, firm_name, phone";

export const ATTORNEY_LIST_SELECT =
  "id, attorney_name, firm_name, phone, email, city, state";
