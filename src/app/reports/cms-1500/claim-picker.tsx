"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatIsoDateDisplay } from "@/lib/date";
import type { CaseClaimOption } from "@/lib/cms1500/fetch";

export function ClaimPicker({
  cases,
  initialCaseId,
}: {
  cases: CaseClaimOption[];
  initialCaseId?: string;
}) {
  const defaultCaseId =
    initialCaseId && cases.some((c) => c.id === initialCaseId)
      ? initialCaseId
      : (cases[0]?.id ?? "");
  const [caseId, setCaseId] = useState(defaultCaseId);
  const selected = useMemo(
    () => cases.find((c) => c.id === caseId),
    [cases, caseId],
  );
  const [dos, setDos] = useState(selected?.serviceDates[0] ?? "");

  const dates = selected?.serviceDates ?? [];

  const onCaseChange = (id: string) => {
    setCaseId(id);
    const next = cases.find((c) => c.id === id);
    setDos(next?.serviceDates[0] ?? "");
  };

  if (cases.length === 0) {
    return (
      <p className="text-sm text-eggplant-700">
        No cases with charges yet. Enter transaction entry on a case first, then
        return here to print CMS-1500 forms.
      </p>
    );
  }

  const printHref =
    caseId && dos
      ? `/reports/cms-1500/print?caseId=${encodeURIComponent(caseId)}&dos=${encodeURIComponent(dos)}`
      : "#";
  const printAllHref = caseId
    ? `/reports/cms-1500/print?caseId=${encodeURIComponent(caseId)}&all=1`
    : "#";

  return (
    <section className="space-y-4 p-4 rounded-xl border border-vice-border bg-white shadow-sm">
      <div>
        <label className="block text-xs font-medium text-eggplant-700 mb-1">
          Case / patient
        </label>
        <select
          value={caseId}
          onChange={(e) => onCaseChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-vice-border rounded-md"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
              {c.patientChart ? ` · #${c.patientChart}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-eggplant-700 mb-1">
          Date of service (treatment day)
        </label>
        {dates.length === 0 ? (
          <p className="text-sm text-eggplant-800">
            This case has no charge lines yet. Use transaction entry to post
            charges for each visit day.
          </p>
        ) : (
          <select
            value={dos}
            onChange={(e) => setDos(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-vice-border rounded-md"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {formatIsoDateDisplay(d)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={printHref}
          target="_blank"
          className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
            caseId && dos
              ? "bg-neon-pink hover:bg-eggplant-800"
              : "bg-vice-border pointer-events-none"
          }`}
        >
          Print CMS-1500 for this day
        </Link>
        <Link
          href={printAllHref}
          target="_blank"
          className={`rounded-md border px-4 py-2 text-sm font-medium ${
            caseId && dates.length
              ? "border-neon-pink text-eggplant-800 hover:bg-neon-mint-100"
              : "border-vice-border text-vice-muted pointer-events-none"
          }`}
        >
          Print all treatment days
        </Link>
      </div>
    </section>
  );
}
