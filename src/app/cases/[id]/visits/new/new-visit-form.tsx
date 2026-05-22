"use client";

import Link from "next/link";
import { useState } from "react";
import { saveVisit } from "./actions";

type Provider = { id: string; full_name: string; credentials: string | null };
type Cpt = { code: string; description: string; default_fee: number | null };

type Line = { cpt: string; units: string; fee: string; modifier: string; icd: string };

export function NewVisitForm({
  caseId,
  patientId,
  defaultVisitDate,
  providers,
  cptCodes,
  diagnosisCodes,
  errorMsg,
}: {
  caseId: string;
  patientId: string;
  defaultVisitDate: string;
  providers: Provider[];
  cptCodes: Cpt[];
  diagnosisCodes: string[];
  errorMsg: string | null;
}) {
  const defaultIcd = diagnosisCodes.filter(Boolean).join(", ");
  const [lines, setLines] = useState<Line[]>([
    { cpt: "", units: "1", fee: "", modifier: "", icd: defaultIcd },
  ]);

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { cpt: "", units: "1", fee: "", modifier: "", icd: defaultIcd },
    ]);

  const updateLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((ln, idx) => (idx === i ? { ...ln, ...patch } : ln)));

  const onCptPick = (i: number, code: string) => {
    const row = cptCodes.find((c) => c.code === code);
    updateLine(i, {
      cpt: code,
      fee: row?.default_fee != null ? String(row.default_fee) : "",
    });
  };

  return (
    <form action={saveVisit} className="space-y-4">
      <input type="hidden" name="case_id" value={caseId} />
      <input type="hidden" name="line_count" value={lines.length} />
      <input type="hidden" name="patient_id" value={patientId} />

      {errorMsg ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {errorMsg === "no_charges"
            ? "Add at least one CPT line."
            : errorMsg === "max_six_lines"
              ? "CMS-1500 allows at most 6 procedure codes per treatment day."
              : errorMsg}
        </p>
      ) : null}

      <section className="p-4 rounded-lg border border-vice-border bg-white shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] font-medium text-eggplant-700">Visit date *</span>
            <input
              type="date"
              name="visit_date"
              required
              defaultValue={defaultVisitDate}
              className="mt-1 w-full px-2 py-1.5 text-sm border border-vice-border rounded"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-eggplant-700">Rendering provider</span>
            <select
              name="provider_id"
              className="mt-1 w-full px-2 py-1.5 text-sm border border-vice-border rounded"
            >
              <option value="">—</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                  {p.credentials ? `, ${p.credentials}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="p-4 rounded-lg border border-vice-border bg-white shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neon-pink">
            Charge lines
          </h2>
          <button
            type="button"
            onClick={addLine}
            className="text-xs text-neon-pink font-medium hover:underline"
          >
            + Add line
          </button>
        </div>
        {lines.map((ln, i) => (
          <div
            key={i}
            className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3 pb-3 border-b border-neon-mint-100 last:border-0"
          >
            <label className="sm:col-span-2">
              <span className="text-[10px] text-vice-muted">CPT</span>
              <select
                name={`line_${i}_cpt`}
                value={ln.cpt}
                onChange={(e) => onCptPick(i, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-vice-border rounded"
              >
                <option value="">—</option>
                {cptCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.description.slice(0, 40)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-[10px] text-vice-muted">Units</span>
              <input
                name={`line_${i}_units`}
                value={ln.units}
                onChange={(e) => updateLine(i, { units: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-vice-border rounded"
              />
            </label>
            <label>
              <span className="text-[10px] text-vice-muted">Fee</span>
              <input
                name={`line_${i}_fee`}
                value={ln.fee}
                onChange={(e) => updateLine(i, { fee: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-vice-border rounded"
              />
            </label>
            <label>
              <span className="text-[10px] text-vice-muted">Mod</span>
              <input
                name={`line_${i}_modifier`}
                value={ln.modifier}
                onChange={(e) => updateLine(i, { modifier: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-vice-border rounded"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-[10px] text-vice-muted">ICD (comma)</span>
              <input
                name={`line_${i}_icd`}
                value={ln.icd}
                onChange={(e) => updateLine(i, { icd: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-vice-border rounded font-mono text-xs"
              />
            </label>
          </div>
        ))}
      </section>

      <div className="flex justify-end gap-2">
        <Link
          href={`/cases/${caseId}`}
          className="px-4 py-2 text-sm border border-vice-border rounded-md hover:bg-vice-surface"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-neon-pink text-white rounded-md hover:bg-eggplant-800 font-medium"
        >
          Save charges
        </button>
      </div>
    </form>
  );
}
