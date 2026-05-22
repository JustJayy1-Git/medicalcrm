"use client";

import type { AttorneyPicker } from "@/lib/attorney";

export function AttorneyPicker({
  label,
  name,
  attorneys,
  defaultAttorneyId,
}: {
  label: string;
  name: string;
  attorneys: AttorneyPicker[];
  defaultAttorneyId?: string;
}) {
  return (
    <section className="mb-3">
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultAttorneyId ?? ""}
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
      >
        <option value="">— Select attorney —</option>
        {attorneys.map((a) => (
          <option key={a.id} value={a.id}>
            {a.firm_name ? `${a.attorney_name} (${a.firm_name})` : a.attorney_name}
          </option>
        ))}
      </select>
    </section>
  );
}
