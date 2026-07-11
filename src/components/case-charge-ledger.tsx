import Link from "next/link";
import { formatIsoDateDisplay } from "@/lib/date";
import type { CaseLedger } from "@/lib/charge-ledger";

export function CaseChargeLedger({
  caseId,
  ledger,
}: {
  caseId: string;
  ledger: CaseLedger;
}) {
  return (
    <section className="p-4 rounded-xl bg-white border border-vice-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neon-pink">
          Treatment charges
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/reports/cms-1500?caseId=${encodeURIComponent(caseId)}`}
            className="text-xs text-neon-pink hover:text-eggplant-800 font-medium"
          >
            CMS-1500 →
          </Link>
          <Link
            href={`/reports/attorney-ledger/print?caseId=${encodeURIComponent(caseId)}`}
            className="text-xs text-neon-pink hover:text-eggplant-800 font-medium"
          >
            Attorney ledger →
          </Link>
          <Link
            href={`/cases/${caseId}/billing-report`}
            className="text-xs text-eggplant-700 hover:text-eggplant-900"
          >
            Treatment summary
          </Link>
          <Link
            href={`/cases/${caseId}/visits/new`}
            className="text-xs border border-vice-border px-2 py-1 rounded-md hover:bg-vice-surface"
          >
            + Transaction entry
          </Link>
        </div>
      </div>

      {ledger.visitCount === 0 ? (
        <p className="text-sm text-vice-muted">
          No visits or charges yet. Use transaction entry to record each treatment day.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-vice-muted border-b border-vice-border">
              <tr>
                <th className="text-left py-2 pr-3">Date</th>
                <th className="text-left py-2 pr-3">Lines</th>
                <th className="text-right py-2">Charges</th>
                <th className="text-right py-2 pl-3">HICFA (CMS-1500)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neon-mint-100">
              {ledger.visits.map((v) => (
                <tr key={v.id}>
                  <td className="py-2 pr-3 font-medium text-eggplant-900">
                    {formatIsoDateDisplay(v.visit_date)}
                  </td>
                  <td className="py-2 pr-3 text-eggplant-700">{v.lineCount}</td>
                  <td className="py-2 text-right tabular-nums">
                    ${v.chargeTotal.toFixed(2)}
                  </td>
                  <td className="py-2 text-right pl-3">
                    <Link
                      href={`/reports/cms-1500/print?caseId=${encodeURIComponent(caseId)}&dos=${encodeURIComponent(v.visit_date)}`}
                      target="_blank"
                      className="text-xs font-semibold text-neon-pink hover:underline"
                      title="Prefilled claim form(s) for this date — consult and therapy print separately"
                    >
                      🖨 Print claim
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-vice-border font-medium">
                <td className="py-2" colSpan={2}>
                  Total ({ledger.visitCount} days)
                </td>
                <td className="py-2 text-right tabular-nums">
                  ${ledger.totalCharges.toFixed(2)}
                </td>
                <td className="py-2 text-right pl-3">
                  <Link
                    href={`/reports/cms-1500/print?caseId=${encodeURIComponent(caseId)}&all=1`}
                    target="_blank"
                    className="text-xs text-neon-pink hover:underline"
                  >
                    Print all days
                  </Link>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
