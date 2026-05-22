import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AGING_BUCKETS } from "@/lib/ar-aging";
import { fetchArAgingReport } from "@/lib/ar-aging-server";
import { fmtMoney } from "@/lib/cpt";

export const dynamic = "force-dynamic";

const BUCKET_LABELS: Record<string, string> = {
  "0-30": "0–30 days",
  "31-60": "31–60 days",
  "61-90": "61–90 days",
  "90+": "90+ days",
};

export default async function ArAgingPage() {
  const supabase = await createClient();
  const report = await fetchArAgingReport(supabase);
  const asOfDisplay = new Date(report.asOfDate + "T12:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <section className="px-6 py-6 max-w-5xl">
      <Link href="/reports" className="text-xs text-vice-muted hover:text-eggplant-900">
        ← Reports
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mt-2 mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mb-1">
            A/R aging
          </p>
          <h1 className="text-2xl font-serif font-semibold text-eggplant-900">
            Accounts receivable aging
          </h1>
          <p className="text-sm text-eggplant-700 mt-1">
            Open balances by insurance carrier · aged from billed date (or date of
            service) · As of {asOfDisplay}
          </p>
        </div>
        <Link
          href="/reports/ar-aging/print"
          className="px-4 py-2 text-sm border border-vice-border rounded-md hover:bg-vice-surface"
        >
          Print report
        </Link>
      </div>

      {report.grandTotal === 0 ? (
        <p className="text-sm text-vice-muted p-6 rounded-xl border border-vice-border bg-white">
          No open balances on file.
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-vice-border bg-white overflow-hidden shadow-sm mb-8">
            <table className="w-full text-sm">
              <thead className="bg-neon-mint-100 text-eggplant-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Insurance carrier</th>
                  {AGING_BUCKETS.map((b) => (
                    <th key={b} className="text-right px-3 py-3 font-medium">
                      {BUCKET_LABELS[b]}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon-mint-100">
                {report.carriers.map((row) => (
                  <tr key={row.carrierId ?? row.carrierName} className="hover:bg-vice-surface">
                    <td className="px-4 py-3 font-medium text-eggplant-900">
                      {row.carrierName}
                      <span className="text-xs text-vice-muted font-normal ml-2">
                        {row.lineCount} line{row.lineCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    {AGING_BUCKETS.map((b) => (
                      <td key={b} className="text-right px-3 py-3 font-mono text-eggplant-800">
                        {row.buckets[b] > 0 ? fmtMoney(row.buckets[b]) : "—"}
                      </td>
                    ))}
                    <td className="text-right px-4 py-3 font-mono font-semibold text-eggplant-900">
                      {fmtMoney(row.total)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-neon-mint-100/80 font-semibold">
                  <td className="px-4 py-3 text-eggplant-900">All carriers</td>
                  {AGING_BUCKETS.map((b) => (
                    <td key={b} className="text-right px-3 py-3 font-mono">
                      {report.grandBuckets[b] > 0
                        ? fmtMoney(report.grandBuckets[b])
                        : "—"}
                    </td>
                  ))}
                  <td className="text-right px-4 py-3 font-mono text-lg">
                    {fmtMoney(report.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-sm font-semibold uppercase tracking-wider text-eggplant-800 mb-3">
            Open charge detail
          </h2>
          <div className="rounded-xl border border-vice-border bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-vice-surface text-eggplant-700 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Case</th>
                  <th className="text-left px-3 py-2">Carrier</th>
                  <th className="text-left px-3 py-2">Service date</th>
                  <th className="text-left px-3 py-2">CPT</th>
                  <th className="text-right px-3 py-2">Days</th>
                  <th className="text-right px-3 py-2">Bucket</th>
                  <th className="text-right px-4 py-2">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon-mint-100">
                {report.lines.slice(0, 100).map((line) => (
                  <tr key={line.chargeId} className="hover:bg-vice-surface">
                    <td className="px-3 py-2">
                      <Link
                        href={`/cases/${line.caseId}`}
                        className="text-neon-pink hover:underline"
                      >
                        {line.caseLabel}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-eggplant-700 text-xs">{line.carrierName}</td>
                    <td className="px-3 py-2 text-eggplant-700">{line.serviceDate}</td>
                    <td className="px-3 py-2">{line.cpt_code ?? "—"}</td>
                    <td className="text-right px-3 py-2 font-mono">{line.daysOld}</td>
                    <td className="text-right px-3 py-2 text-xs">{line.bucket}</td>
                    <td className="text-right px-4 py-2 font-mono">
                      {fmtMoney(line.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.lines.length > 100 && (
              <p className="text-xs text-vice-muted px-4 py-2 border-t border-neon-mint-100">
                Showing 100 of {report.lines.length} lines — use Print for the full list.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
