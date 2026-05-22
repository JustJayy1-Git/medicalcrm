"use client";

import { useRouter } from "next/navigation";

export function AttorneyLedgerCasePicker({
  cases,
  initialCaseId,
}: {
  cases: { id: string; label: string }[];
  initialCaseId?: string;
}) {
  const router = useRouter();

  return (
    <section className="space-y-4">
      <label className="block text-sm font-medium text-eggplant-800">
        Case
        <select
          className="mt-1 w-full px-3 py-2 border border-vice-border rounded-lg bg-white text-sm"
          defaultValue={initialCaseId ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            if (id) {
              router.push(
                `/reports/attorney-ledger/print?caseId=${encodeURIComponent(id)}`,
              );
            }
          }}
        >
          <option value="">Select a case…</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {initialCaseId ? (
        <a
          href={`/reports/attorney-ledger/print?caseId=${encodeURIComponent(initialCaseId)}`}
          className="inline-block px-4 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md"
        >
          Open attorney ledger
        </a>
      ) : null}
    </section>
  );
}
