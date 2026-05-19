"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatCarrierMailingAddress,
  type InsuranceCarrierPicker,
} from "@/lib/insurance-carrier";

/**
 * Carrier dropdown + read-only claims contact panel.
 * Used on case policy tabs — patient-specific fields (policy #, adjuster) stay manual.
 */
export function CarrierPicker({
  name,
  label,
  carriers,
  defaultCarrierId = "",
  emptyHint = "No carriers yet — add them under Insurance.",
}: {
  name: string;
  label: string;
  carriers: InsuranceCarrierPicker[];
  defaultCarrierId?: string;
  emptyHint?: string;
}) {
  const [selectedId, setSelectedId] = useState(defaultCarrierId || "");

  const selected = useMemo(
    () => carriers.find((c) => c.id === selectedId) ?? null,
    [carriers, selectedId],
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-stone-600 mb-1">
          {label}
        </label>
        <select
          name={name}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
        >
          <option value="">— Select carrier —</option>
          {carriers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.seed_key ? " · FL common" : ""}
            </option>
          ))}
        </select>
        {carriers.length === 0 && (
          <p className="text-[10px] text-stone-500 mt-1">
            {emptyHint}{" "}
            <Link href="/insurance/new" className="text-amber-700 hover:text-amber-800">
              Add one
            </Link>
          </p>
        )}
      </div>

      {selected && <CarrierReferencePanel carrier={selected} />}
    </div>
  );
}

export function CarrierReferencePanel({
  carrier,
}: {
  carrier: InsuranceCarrierPicker;
}) {
  const address = formatCarrierMailingAddress(carrier);

  return (
    <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-3 text-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800 mb-2">
        From carrier file — use for claims &amp; billing
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-stone-700">
        <Item label="Payer ID (EDI)" value={carrier.payer_id} mono />
        <Item label="Claims phone" value={carrier.phone} />
        <Item label="Claims fax" value={carrier.fax} />
        <Item label="Claims email" value={carrier.email} />
        {address && (
          <div className="sm:col-span-2">
            <dt className="text-[10px] uppercase tracking-wide text-stone-500">
              Claims mailing address
            </dt>
            <dd className="whitespace-pre-line mt-0.5">{address}</dd>
          </div>
        )}
      </dl>
      {carrier.notes && (
        <p className="mt-2 text-xs text-stone-500 border-t border-amber-200/60 pt-2">
          {carrier.notes}
        </p>
      )}
      <p className="mt-2 text-[10px] text-stone-500">
        Enter policy #, claim #, and adjuster below — those are unique to this patient.
        {" "}
        <Link
          href={`/insurance/${carrier.id}`}
          className="text-amber-700 hover:text-amber-800 font-medium"
        >
          Edit carrier master
        </Link>
      </p>
    </div>
  );
}

function Item({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className={mono ? "font-mono text-xs mt-0.5" : "mt-0.5"}>
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

