"use client";

import type { ReactNode } from "react";
import {
  dayTotalForDate,
  type CaseLedger,
} from "@/lib/charge-ledger";
import { fmtDos } from "@/lib/charge-entry";
import { fmtMoney } from "@/lib/cpt";

function SummaryRow({
  label,
  value,
  valueClassName = "font-medium",
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <section className="flex justify-between gap-2">
      <span className="text-vice-muted">{label}</span>
      <span className={valueClassName}>{value}</span>
    </section>
  );
}

export function TransactionEntrySummary({
  ledger,
  visitDate,
  entrySubtotal,
  nextVisitNumber,
  visitCap,
}: {
  ledger: CaseLedger;
  visitDate: string;
  entrySubtotal: number;
  nextVisitNumber: number;
  visitCap: number;
}) {
  const savedOnDay = dayTotalForDate(ledger, visitDate);
  const dayTotalAfterSave = savedOnDay + entrySubtotal;
  const accountTotalAfterSave = ledger.accountTotal + entrySubtotal;
  const lastVisit = ledger.lastServiceDate;

  return (
    <aside className="rounded-lg border border-vice-border bg-vice-surface text-sm shrink-0 w-full lg:w-72">
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr className="bg-vice-border text-eggplant-800">
            <th className="px-2 py-1 text-center font-semibold">0–30</th>
            <th className="px-2 py-1 text-center font-semibold">31–60</th>
            <th className="px-2 py-1 text-center font-semibold">61–90</th>
            <th className="px-2 py-1 text-center font-semibold">91+</th>
          </tr>
        </thead>
        <tbody>
          <tr className="font-mono text-eggplant-700">
            <td className="px-2 py-1 text-center border border-vice-border">—</td>
            <td className="px-2 py-1 text-center border border-vice-border">—</td>
            <td className="px-2 py-1 text-center border border-vice-border">—</td>
            <td className="px-2 py-1 text-center border border-vice-border">—</td>
          </tr>
        </tbody>
      </table>
      <p className="text-[9px] text-vice-muted px-2 py-1 border-b border-vice-border">
        Aging — payments module coming later
      </p>

      <section className="p-3 space-y-2 border-b border-vice-border">
        <p className="flex justify-between text-xs">
          <span className="text-eggplant-700">Charges (this entry)</span>
          <span className="font-mono font-medium">{fmtMoney(entrySubtotal)}</span>
        </p>
        <p className="flex justify-between text-xs">
          <span className="text-eggplant-700">Day total (after save)</span>
          <span className="font-mono font-medium">{fmtMoney(dayTotalAfterSave)}</span>
        </p>
        <p className="flex justify-between text-xs">
          <span className="text-eggplant-700">Payment</span>
          <span className="font-mono text-vice-muted">—</span>
        </p>
        <p className="flex justify-between text-xs font-semibold border-t border-vice-border pt-2">
          <span className="text-eggplant-800">Balance</span>
          <span className="font-mono">{fmtMoney(accountTotalAfterSave)}</span>
        </p>
      </section>

      <section className="p-3 bg-neon-mint-100 border-b border-neon-mint-100">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-eggplant-800">
          Account total
        </p>
        <p className="text-2xl font-mono font-bold text-eggplant-900 tabular-nums">
          {fmtMoney(accountTotalAfterSave)}
        </p>
        <p className="text-[10px] text-vice-muted mt-1">
          On file now: {fmtMoney(ledger.accountTotal)}
        </p>
      </section>

      <section className="p-3 space-y-1.5 text-xs">
        <SummaryRow
          label="Last visit"
          value={lastVisit ? fmtDos(lastVisit) : "—"}
          valueClassName="font-medium tabular-nums"
        />
        <SummaryRow
          label="Visit"
          value={`${nextVisitNumber} of ${visitCap}`}
        />
        <SummaryRow
          label="Selected DOS"
          value={fmtDos(visitDate)}
          valueClassName="font-medium tabular-nums"
        />
        <SummaryRow
          label="Saved on DOS"
          value={fmtMoney(savedOnDay)}
          valueClassName="font-mono font-medium"
        />
      </section>
    </aside>
  );
}
