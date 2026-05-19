/** Fields loaded for carrier pickers (case policy tab, etc.). */
export const CARRIER_PICKER_SELECT =
  "id, name, carrier_type, payer_id, phone, fax, email, address_line1, address_line2, city, state, zip, notes, seed_key, sort_rank" as const;

export type InsuranceCarrierPicker = {
  id: string;
  name: string;
  carrier_type: string | null;
  payer_id: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  seed_key: string | null;
  sort_rank: number | null;
};

export function formatCarrierMailingAddress(c: InsuranceCarrierPicker): string | null {
  const lines = [
    c.address_line1,
    c.address_line2,
    [c.city, c.state].filter(Boolean).join(", ") +
      (c.zip ? ` ${c.zip}` : ""),
  ].filter((line) => line && line.trim() !== "");
  return lines.length > 0 ? lines.join("\n") : null;
}
