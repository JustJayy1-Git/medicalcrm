"use client";

import { useMemo, useState } from "react";
import { postBatchPayment } from "../actions";

export type OpenChargeLine = {
  id: string;
  visit_date: string;
  cpt_code: string | null;
  balance: number;
  charged: string;
};

export function BatchPaymentForm({
  caseId,
  lines,
  defaultDate,
}: {
  caseId: string;
  lines: OpenChargeLine[];
  defaultDate: string;
}) {
  const [checkAmount, setCheckAmount] = useState("");
  const [paidDate, setPaidDate] = useState(defaultDate);
  const [checkRef, setCheckRef] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const sorted = useMemo(
    () => [...lines].sort((a, b) => a.visit_date.localeCompare(b.visit_date)),
    [lines],
  );

  const selectedTotal = useMemo(() => {
    return sorted.reduce((sum, line) => {
      if (!selected[line.id]) return sum;
      return sum + (Number(amounts[line.id]) || 0);
    }, 0);
  }, [sorted, selected, amounts]);

  function toggleLine(id: string, balance: number, on: boolean) {
    setSelected((s) => ({ ...s, [id]: on }));
    if (on && !amounts[id]) {
      setAmounts((a) => ({ ...a, [id]: balance.toFixed(2) }));
    }
  }

  function selectAllOpen() {
    const nextSel: Record<string, boolean> = {};
    const nextAmt: Record<string, string> = {};
    for (const line of sorted) {
      nextSel[line.id] = true;
      nextAmt[line.id] = line.balance.toFixed(2);
    }
    setSelected(nextSel);
    setAmounts(nextAmt);
  }

  function clearSelection() {
    setSelected({});
    setAmounts({});
  }

  /** Apply check total oldest-service-date first (Medisoft-style). */
  function distributeCheck() {
    const check = Number(checkAmount);
    if (Number.isNaN(check) || check <= 0) return;

    let remaining = check;
    const nextSel: Record<string, boolean> = {};
    const nextAmt: Record<string, string> = {};

    for (const line of sorted) {
      if (remaining <= 0) break;
      const apply = Math.min(line.balance, remaining);
      if (apply > 0) {
        nextSel[line.id] = true;
        nextAmt[line.id] = apply.toFixed(2);
        remaining -= apply;
      }
    }

    setSelected(nextSel);
    setAmounts(nextAmt);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const entries = sorted
      .filter((line) => selected[line.id])
      .map((line) => ({
        chargeId: line.id,
        amount: Number(amounts[line.id]) || 0,
      }))
      .filter((x) => x.amount > 0);

    const hidden = form.querySelector<HTMLInputElement>('input[name="entries"]');
    if (hidden) hidden.value = JSON.stringify(entries);
    form.requestSubmit();
  }

  return (
    <form action={postBatchPayment} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="case_id" value={caseId} />
      <input type="hidden" name="entries" defaultValue="[]" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-neon-mint-100 bg-neon-mint-100/50">
        <label className="text-sm text-eggplant-800">
          Check / EFT amount
          <input
            type="number"
            step="0.01"
            min="0"
            value={checkAmount}
            onChange={(e) => setCheckAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-vice-border rounded-lg text-sm font-mono"
            placeholder="0.00"
          />
        </label>
        <label className="text-sm text-eggplant-800">
          Paid date
          <input
            name="paid_date"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-vice-border rounded-lg text-sm"
          />
        </label>
        <label className="text-sm text-eggplant-800">
          Check / ref # (optional)
          <input
            name="check_ref"
            type="text"
            value={checkRef}
            onChange={(e) => setCheckRef(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-vice-border rounded-lg text-sm"
            placeholder="e.g. 10482"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={distributeCheck}
          className="px-3 py-1.5 border border-neon-mint text-eggplant-900 rounded-md hover:bg-neon-mint-100"
        >
          Distribute check (oldest first)
        </button>
        <button
          type="button"
          onClick={selectAllOpen}
          className="px-3 py-1.5 border border-vice-border rounded-md hover:bg-vice-surface"
        >
          Select all · pay in full
        </button>
        <button
          type="button"
          onClick={clearSelection}
          className="px-3 py-1.5 text-eggplant-700 hover:text-eggplant-900"
        >
          Clear
        </button>
      </div>

      <div className="rounded-xl border border-vice-border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vice-surface text-xs uppercase text-eggplant-700">
            <tr>
              <th className="w-10 px-3 py-2" />
              <th className="text-left px-3 py-2">Service date</th>
              <th className="text-left px-3 py-2">CPT</th>
              <th className="text-right px-3 py-2">Due</th>
              <th className="text-right px-4 py-2">Apply</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neon-mint-100">
            {sorted.map((line) => (
              <tr key={line.id} className={selected[line.id] ? "bg-neon-mint-100/40" : ""}>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!selected[line.id]}
                    onChange={(e) => toggleLine(line.id, line.balance, e.target.checked)}
                  />
                </td>
                <td className="px-3 py-2 text-eggplant-800">{line.visit_date}</td>
                <td className="px-3 py-2">
                  {line.cpt_code ?? "—"}
                  <span className="text-xs text-vice-muted block">{line.charged}</span>
                </td>
                <td className="px-3 py-2 text-right font-mono">${line.balance.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={line.balance}
                    disabled={!selected[line.id]}
                    value={amounts[line.id] ?? ""}
                    onChange={(e) =>
                      setAmounts((a) => ({ ...a, [line.id]: e.target.value }))
                    }
                    className="w-24 px-2 py-1 border border-vice-border rounded text-sm font-mono text-right disabled:bg-neon-mint-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-vice-border">
        <p className="text-sm text-eggplant-700">
          Selected total:{" "}
          <span className="font-mono font-semibold text-eggplant-900">
            ${selectedTotal.toFixed(2)}
          </span>
          {checkAmount && (
            <span className="text-vice-muted ml-2">
              (check ${Number(checkAmount).toFixed(2)})
            </span>
          )}
        </p>
        <button
          type="submit"
          className="px-5 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm"
        >
          Post batch payment
        </button>
      </div>
    </form>
  );
}
