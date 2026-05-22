"use client";

import {
  dayTotalForDate,
  type CaseLedger,
} from "@/lib/charge-ledger";
import { fmtMoney } from "@/lib/cpt";

function fmtServiceDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function VisitChargeTotals({
  ledger,
  visitDate,
  entrySubtotal,
}: {
  ledger: CaseLedger;
  visitDate: string;
  entrySubtotal: number;
}) {
  const savedOnDay = dayTotalForDate(ledger, visitDate);
  const dayTotalAfterSave = savedOnDay + entrySubtotal;
  const accountTotalAfterSave = ledger.accountTotal + entrySubtotal;

  return (
    <section className="rounded-lg border border-neon-mint-100 bg-neon-mint-100/80 p-4 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-eggplant-800">
        Charge totals
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <p className="text-[11px] text-eggplant-700">This entry</p>
          <p className="text-lg font-mono font-semibold text-eggplant-900">
            {fmtMoney(entrySubtotal)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-eggplant-700">
            Already saved on {fmtServiceDate(visitDate)}
          </p>
          <p className="text-lg font-mono font-semibold text-eggplant-900">
            {fmtMoney(savedOnDay)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-eggplant-700">Day total (after save)</p>
          <p className="text-lg font-mono font-semibold text-eggplant-900">
            {fmtMoney(dayTotalAfterSave)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-eggplant-700">Account total (case)</p>
          <p className="text-lg font-mono font-semibold text-eggplant-900">
            {fmtMoney(accountTotalAfterSave)}
          </p>
        </div>
      </div>
      {savedOnDay > 0 && (
        <p className="text-xs text-eggplant-800">
          Charges for this date of service are added to the same day — you do not
          need a separate visit for each line.
        </p>
      )}
      {ledger.days.length > 0 && (
        <div className="pt-2 border-t border-neon-mint-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-eggplant-700 mb-2">
            Daily totals on file
          </p>
          <ul className="max-h-32 overflow-y-auto text-xs space-y-1">
            {[...ledger.days].reverse().map((d) => (
              <li
                key={d.visit_date}
                className={[
                  "flex justify-between gap-2 font-mono",
                  d.visit_date === visitDate
                    ? "text-eggplant-900 font-semibold"
                    : "text-eggplant-800",
                ].join(" ")}
              >
                <span>{fmtServiceDate(d.visit_date)}</span>
                <span>{fmtMoney(d.dayTotal)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
