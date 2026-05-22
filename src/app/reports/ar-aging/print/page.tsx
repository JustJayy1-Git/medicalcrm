import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AGING_BUCKETS } from "@/lib/ar-aging";
import { fetchArAgingReport } from "@/lib/ar-aging-server";
import { fmtMoney } from "@/lib/cpt";

export const dynamic = "force-dynamic";

const BUCKET_LABELS: Record<string, string> = {
  "0-30": "0–30",
  "31-60": "31–60",
  "61-90": "61–90",
  "90+": "90+",
};

export default async function ArAgingPrintPage() {
  const supabase = await createClient();
  const report = await fetchArAgingReport(supabase);
  const printed = new Date().toLocaleString("en-US");

  return (
    <html lang="en">
      <head>
        <title>A/R aging — Pro Injury</title>
        <style>{`
          * { box-sizing: border-box; }
          body { font-family: Georgia, serif; font-size: 9pt; color: #1c1917; margin: 0; padding: 20px 28px; }
          h1 { font-size: 14pt; margin: 0 0 4px; }
          .meta { color: #57534e; margin-bottom: 16px; font-size: 8pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th, td { border: 1px solid #d6d3d1; padding: 4px 6px; }
          th { background: #f5f5f4; text-transform: uppercase; font-size: 7pt; }
          .num { text-align: right; font-family: ui-monospace, monospace; }
          .total { background: #fffbeb; font-weight: 700; }
          .no-print { margin-bottom: 12px; }
          @media print { .no-print { display: none; } }
        `}</style>
      </head>
      <body>
        <div class="no-print">
          <Link href="/reports/ar-aging">← Back</Link>
          <button type="button" onclick="window.print()" style="margin-left: 8px">
            Print
          </button>
        </div>
        <h1>Accounts receivable aging</h1>
        <p class="meta">
          By insurance carrier · As of {report.asOfDate} · Printed {printed}
        </p>

        {report.grandTotal === 0 ? (
          <p>No open balances.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Carrier</th>
                  {AGING_BUCKETS.map((b) => (
                    <th key={b} class="num">
                      {BUCKET_LABELS[b]} days
                    </th>
                  ))}
                  <th class="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.carriers.map((row) => (
                  <tr key={row.carrierId ?? row.carrierName}>
                    <td>{row.carrierName}</td>
                    {AGING_BUCKETS.map((b) => (
                      <td key={b} class="num">
                        {row.buckets[b] > 0 ? fmtMoney(row.buckets[b]) : "—"}
                      </td>
                    ))}
                    <td class="num">{fmtMoney(row.total)}</td>
                  </tr>
                ))}
                <tr class="total">
                  <td>Grand total</td>
                  {AGING_BUCKETS.map((b) => (
                    <td key={b} class="num">
                      {report.grandBuckets[b] > 0 ? fmtMoney(report.grandBuckets[b]) : "—"}
                    </td>
                  ))}
                  <td class="num">{fmtMoney(report.grandTotal)}</td>
                </tr>
              </tbody>
            </table>

            <h2 style={{ fontSize: "11pt", marginTop: 20 }}>Detail</h2>
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Carrier</th>
                  <th>Date</th>
                  <th>CPT</th>
                  <th class="num">Days</th>
                  <th class="num">Balance</th>
                </tr>
              </thead>
              <tbody>
                {report.lines.map((line) => (
                  <tr key={line.chargeId}>
                    <td>{line.caseLabel}</td>
                    <td>{line.carrierName}</td>
                    <td>{line.serviceDate}</td>
                    <td>{line.cpt_code ?? "—"}</td>
                    <td class="num">{line.daysOld}</td>
                    <td class="num">{fmtMoney(line.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </body>
    </html>
  );
}
