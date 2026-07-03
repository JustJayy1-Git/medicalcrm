import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCaseLedger } from "@/lib/charge-ledger-server";
import { lineAmount } from "@/lib/charge-ledger";
import { fmtMoney, fmtVisitType } from "@/lib/cpt";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BillingReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;
  const supabase = await createClient();

  const { data: c } = await supabase
    .from("cases")
    .select(
      `id, case_number, date_of_injury, description, case_type,
       patient:patients(first_name, last_name, chart_number, date_of_birth)`,
    )
    .eq("id", caseId)
    .maybeSingle();

  if (!c) notFound();
  const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
  if (!patient) notFound();

  const ledger = await fetchCaseLedger(supabase, caseId);
  const printed = new Date().toLocaleString("en-US");

  return (
    <html lang="en">
      <head>
        <title>
          Treatment summary — {patient.last_name}, {patient.first_name}
        </title>
        <style>{`
          * { box-sizing: border-box; }
          body { font-family: Georgia, 'Times New Roman', serif; color: #1c1917; margin: 0; padding: 24px 32px; font-size: 11pt; }
          h1 { font-size: 18pt; margin: 0 0 4px; }
          .meta { font-size: 10pt; color: #57534e; margin-bottom: 20px; }
          .grand { border: 2px solid #ff2d8a; padding: 12px 16px; margin: 16px 0 24px; display: flex; justify-content: space-between; align-items: center; }
          .grand strong { font-size: 12pt; text-transform: uppercase; letter-spacing: 0.05em; }
          .grand span { font-size: 16pt; font-family: ui-monospace, monospace; font-weight: 700; }
          .day { margin-bottom: 20px; page-break-inside: avoid; }
          .day-hdr { background: #f5f5f4; padding: 8px 12px; font-weight: 700; display: flex; justify-content: space-between; border: 1px solid #d6d3d1; border-bottom: none; }
          table { width: 100%; border-collapse: collapse; font-size: 10pt; }
          th, td { border: 1px solid #d6d3d1; padding: 6px 8px; text-align: left; }
          th { background: #fafaf9; font-size: 9pt; text-transform: uppercase; }
          .num { text-align: right; font-family: ui-monospace, monospace; }
          .no-print { margin-bottom: 16px; }
          .letterhead { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
          .letterhead img { width: 68px; height: 68px; object-fit: contain; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 12px; }
          }
        `}</style>
      </head>
      <body>
        <div className="no-print">
          <Link href={`/cases/${caseId}`} style={{ fontSize: "10pt" }}>
            ← Back to case
          </Link>
          <PrintButton />
        </div>

        <div className="letterhead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light-header.png" alt="Pro Injury" />
          <h1>Treatment charge summary</h1>
        </div>
        <p className="meta">
          <strong>
            {patient.last_name}, {patient.first_name}
          </strong>
          {patient.chart_number ? ` · Chart ${patient.chart_number}` : ""}
          <br />
          Case {c.case_number ?? caseId.slice(0, 8)}
          {c.description ? ` · ${c.description}` : ""}
          <br />
          Date of injury: {c.date_of_injury ? fmtDate(c.date_of_injury) : "—"}
          <br />
          Printed: {printed}
        </p>

        <div className="grand">
          <strong>Total treatment charges (beginning to end)</strong>
          <span>{fmtMoney(ledger.accountTotal)}</span>
        </div>

        {ledger.days.length === 0 ? (
          <p>No charges on file for this case.</p>
        ) : (
          ledger.days.map((day) => (
            <div key={day.visit_date} className="day">
              <div className="day-hdr">
                <span>{fmtDate(day.visit_date)}</span>
                <span>Day total: {fmtMoney(day.dayTotal)}</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Visit #</th>
                    <th>Type</th>
                    <th>CPT</th>
                    <th className="num">Units</th>
                    <th className="num">Fee</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {day.visits.flatMap((v) =>
                    (v.charges ?? []).map((ch) => (
                      <tr key={ch.id}>
                        <td>{v.visit_number ?? "—"}</td>
                        <td>{fmtVisitType(v.visit_type)}</td>
                        <td>
                          {ch.cpt_code}
                          {ch.modifier ? `-${ch.modifier}` : ""}
                        </td>
                        <td className="num">{ch.units}</td>
                        <td className="num">{fmtMoney(ch.fee)}</td>
                        <td className="num">
                          {fmtMoney(lineAmount(ch))}
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          ))
        )}

        <p className="meta" style={{ marginTop: 24 }}>
          {ledger.visitCount} visit(s) · {ledger.chargeLineCount} charge line(s)
          {ledger.firstServiceDate && ledger.lastServiceDate
            ? ` · Service from ${fmtDate(ledger.firstServiceDate)} through ${fmtDate(ledger.lastServiceDate)}`
            : ""}
        </p>
      </body>
    </html>
  );
}
