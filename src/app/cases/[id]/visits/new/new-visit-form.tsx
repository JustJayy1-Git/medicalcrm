"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveVisit } from "./actions";
import { fmtMoney, type CptCode, type MultilinkTemplate, type MultilinkTemplateLine } from "@/lib/cpt";

type Provider = {
  id: string;
  full_name: string;
  credentials: string | null;
};

type TemplateWithLines = MultilinkTemplate & {
  lines: MultilinkTemplateLine[];
};

type ChargeRow = {
  rowKey: string;
  cpt_code: string;
  units: number;
  fee_per_unit: number;
  modifier: string;
  /** Comma-separated ICD codes (e.g., "S13.4XXA, M25.552"). */
  icd_codes: string;
};

function newRow(partial?: Partial<ChargeRow>): ChargeRow {
  return {
    rowKey: crypto.randomUUID(),
    cpt_code: "",
    units: 1,
    fee_per_unit: 0,
    modifier: "",
    icd_codes: "",
    ...partial,
  };
}

const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export function NewVisitForm({
  caseId,
  patientId,
  nextVisitNumber,
  providers,
  cpt,
  templates,
}: {
  caseId: string;
  patientId: string;
  nextVisitNumber: number;
  providers: Provider[];
  cpt: CptCode[];
  templates: TemplateWithLines[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [visitDate, setVisitDate] = useState(todayIso());
  const [visitType, setVisitType] = useState<string>("office");
  const [providerId, setProviderId] = useState<string>("");
  const [pos, setPos] = useState<string>("11");
  const [notes, setNotes] = useState<string>("");

  const [rows, setRows] = useState<ChargeRow[]>([newRow()]);

  // CPT lookup map
  const cptByCode = useMemo(() => {
    const m = new Map<string, CptCode>();
    for (const c of cpt) m.set(c.code, c);
    return m;
  }, [cpt]);

  // Apply a MultiLink template — appends lines to the grid
  const applyTemplate = (t: TemplateWithLines) => {
    const newRows: ChargeRow[] = t.lines.map((ln) =>
      newRow({
        cpt_code: ln.cpt_code,
        units: ln.units,
        fee_per_unit:
          ln.fee_per_unit ?? cptByCode.get(ln.cpt_code)?.default_fee ?? 0,
        modifier: ln.modifier ?? "",
      }),
    );
    // Drop empty trailing rows before appending
    setRows((prev) => {
      const filtered = prev.filter(
        (r) => r.cpt_code.trim() !== "" || r.fee_per_unit > 0,
      );
      const next = [...filtered, ...newRows];
      // If grid was empty AND we just appended, also add a blank row at the end
      return [...next, newRow()];
    });
    // Auto-set visit_type from the template
    if (visitType === "office" && t.visit_type) setVisitType(t.visit_type);
  };

  const updateRow = (rowKey: string, patch: Partial<ChargeRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowKey !== rowKey) return r;
        const next = { ...r, ...patch };
        // Auto-fill fee/units when a CPT is selected and the fee is still 0
        if (patch.cpt_code !== undefined && patch.cpt_code !== r.cpt_code) {
          const c = cptByCode.get(patch.cpt_code);
          if (c) {
            if (!r.fee_per_unit || r.fee_per_unit === 0) {
              next.fee_per_unit = c.default_fee;
            }
          }
        }
        return next;
      }),
    );
  };

  const removeRow = (rowKey: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.rowKey !== rowKey);
      return next.length === 0 ? [newRow()] : next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);

  const populatedRows = rows.filter((r) => r.cpt_code.trim() !== "");
  const subtotal = populatedRows.reduce(
    (sum, r) => sum + r.units * r.fee_per_unit,
    0,
  );

  const onSubmit = (formData: FormData) => {
    // Filter out empty rows before sending
    formData.set(
      "charges_json",
      JSON.stringify(
        populatedRows.map((r, i) => ({
          line_number: i + 1,
          cpt_code: r.cpt_code,
          units: Number(r.units) || 1,
          fee_per_unit: Number(r.fee_per_unit) || 0,
          modifier: r.modifier.trim() || null,
          icd_codes: r.icd_codes
            .split(/[,\s]+/)
            .map((s) => s.trim())
            .filter(Boolean),
        })),
      ),
    );
    startTransition(async () => {
      await saveVisit(formData);
    });
  };

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="case_id" value={caseId} />
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="visit_number" value={nextVisitNumber} />

      {/* Visit header */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500 mb-3">
          Visit details
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-stone-600">Date of service</span>
            <input
              type="date"
              name="visit_date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
              className="rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-600 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-stone-600">Visit type</span>
            <select
              name="visit_type"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-600 focus:outline-none"
            >
              <option value="eval">Initial / Eval</option>
              <option value="office">Therapy</option>
              <option value="reeval">Re-eval / Follow-up</option>
              <option value="consult">Consult</option>
              <option value="tele">Telehealth</option>
              <option value="discharge">Discharge</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-stone-600">Provider</span>
            <select
              name="provider_id"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-600 focus:outline-none"
            >
              <option value="">— select —</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                  {p.credentials ? `, ${p.credentials}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-stone-600">Place of service</span>
            <select
              name="place_of_service"
              value={pos}
              onChange={(e) => setPos(e.target.value)}
              className="rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-600 focus:outline-none"
            >
              <option value="11">11 — Office</option>
              <option value="12">12 — Home</option>
              <option value="22">22 — Outpatient hospital</option>
              <option value="49">49 — Independent clinic</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-stone-600">Visit #</span>
            <div className="px-2 py-1 text-sm bg-stone-50 rounded border border-stone-200 font-mono">
              {nextVisitNumber} of 23
            </div>
          </label>
        </div>
      </div>

      {/* MultiLink templates */}
      {templates.length > 0 && (
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500 mb-3">
            Quick add (MultiLink)
          </p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
                title={t.description ?? undefined}
              >
                + {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Charges grid */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
            Charges
          </p>
          <button
            type="button"
            onClick={addRow}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium"
          >
            + Add line
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="text-left py-1.5 pr-2 font-medium">CPT</th>
                <th className="text-left py-1.5 pr-2 font-medium">Description</th>
                <th className="text-right py-1.5 pr-2 font-medium w-16">Units</th>
                <th className="text-right py-1.5 pr-2 font-medium w-24">Fee</th>
                <th className="text-right py-1.5 pr-2 font-medium w-24">Total</th>
                <th className="text-left py-1.5 pr-2 font-medium w-16">Mod</th>
                <th className="text-left py-1.5 pr-2 font-medium">
                  Diagnoses (ICD-10)
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const c = cptByCode.get(r.cpt_code);
                const lineTotal = r.units * r.fee_per_unit;
                return (
                  <tr key={r.rowKey} className="border-b border-stone-100">
                    <td className="py-1 pr-2">
                      <input
                        list="cpt-list"
                        value={r.cpt_code}
                        onChange={(e) =>
                          updateRow(r.rowKey, {
                            cpt_code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="97110"
                        className="w-24 rounded border border-stone-300 px-2 py-1 text-sm font-mono focus:border-amber-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-1 pr-2 text-stone-600 text-xs">
                      {c?.description ?? ""}
                    </td>
                    <td className="py-1 pr-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={r.units}
                        onChange={(e) =>
                          updateRow(r.rowKey, {
                            units: Number(e.target.value) || 1,
                          })
                        }
                        className="w-14 text-right rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-1 pr-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={r.fee_per_unit}
                        onChange={(e) =>
                          updateRow(r.rowKey, {
                            fee_per_unit: Number(e.target.value) || 0,
                          })
                        }
                        className="w-20 text-right rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-1 pr-2 text-right font-mono text-stone-900">
                      {fmtMoney(lineTotal)}
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        value={r.modifier}
                        onChange={(e) =>
                          updateRow(r.rowKey, { modifier: e.target.value })
                        }
                        placeholder="GP"
                        className="w-14 rounded border border-stone-300 px-2 py-1 text-sm font-mono focus:border-amber-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        value={r.icd_codes}
                        onChange={(e) =>
                          updateRow(r.rowKey, { icd_codes: e.target.value })
                        }
                        placeholder="S13.4XXA, M25.552"
                        className="w-full min-w-[200px] rounded border border-stone-300 px-2 py-1 text-sm font-mono focus:border-amber-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-1 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(r.rowKey)}
                        className="text-stone-400 hover:text-red-600 text-sm"
                        aria-label="Remove line"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-300 font-semibold">
                <td colSpan={4} className="py-2 pr-2 text-right text-stone-500 text-xs uppercase tracking-wider">
                  Visit total
                </td>
                <td className="py-2 pr-2 text-right font-mono text-stone-900">
                  {fmtMoney(subtotal)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* CPT autocomplete datalist */}
        <datalist id="cpt-list">
          {cpt.map((c) => (
            <option key={c.code} value={c.code}>
              {c.description}
            </option>
          ))}
        </datalist>
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
            Visit notes
          </span>
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="rounded border border-stone-300 px-2 py-1 text-sm focus:border-amber-600 focus:outline-none"
            placeholder="Optional clinical or billing notes for this visit"
          />
        </label>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 z-10 -mx-6 px-6 py-3 bg-stone-50/95 backdrop-blur border-t border-stone-200 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-stone-500">{populatedRows.length} line(s) · </span>
          <span className="font-mono font-semibold text-stone-900">
            {fmtMoney(subtotal)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push(`/cases/${caseId}`)}
            disabled={isPending}
            className="rounded-md border border-stone-300 bg-white px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || populatedRows.length === 0}
            className="rounded-md bg-amber-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save visit"}
          </button>
        </div>
      </div>
    </form>
  );
}
