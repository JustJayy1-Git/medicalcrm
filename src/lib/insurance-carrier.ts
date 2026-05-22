export type InsuranceCarrierPicker = {
  id: string;
  name: string;
  payer_id?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

export type InsuranceCarrierListRow = InsuranceCarrierPicker & {
  carrier_type?: string | null;
  seed_key?: string | null;
};

export const CARRIER_PICKER_SELECT =
  "id, name, payer_id, phone, address_line1, address_line2, city, state, zip";

export const CARRIER_LIST_SELECT =
  "id, name, payer_id, phone, address_line1, address_line2, city, state, zip, carrier_type, seed_key";
