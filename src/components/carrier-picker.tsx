"use client";

import type { InsuranceCarrierPicker } from "@/lib/insurance-carrier";

export function CarrierReferencePanel({
  carrier,
}: {
  carrier: InsuranceCarrierPicker;
}) {
  const addr = [
    carrier.address_line1,
    carrier.address_line2,
    [carrier.city, carrier.state, carrier.zip].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <section className="p-3 rounded-lg bg-neon-mint-100 border border-neon-mint-100 text-sm">
      <p className="font-medium text-eggplant-900">{carrier.name}</p>
      {carrier.payer_id ? (
        <p className="text-xs text-eggplant-700">Payer ID: {carrier.payer_id}</p>
      ) : null}
      {addr ? <p className="text-xs text-eggplant-700 mt-1">{addr}</p> : null}
      {carrier.phone ? (
        <p className="text-xs text-eggplant-700">Phone: {carrier.phone}</p>
      ) : null}
    </section>
  );
}

export function CarrierPicker({
  label,
  name,
  carriers,
  defaultCarrierId,
}: {
  label: string;
  name: string;
  carriers: InsuranceCarrierPicker[];
  defaultCarrierId?: string;
}) {
  return (
    <section className="mb-3">
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultCarrierId ?? ""}
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
      >
        <option value="">— Select carrier —</option>
        {carriers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </section>
  );
}
