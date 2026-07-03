import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAttorneyCaseLedger } from "@/lib/attorney-ledger-server";
import { fmtMoney } from "@/lib/cpt";
import { PrintButton } from "@/app/cases/[id]/billing-report/print-button";

export const dynamic = "force-dynamic";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AttorneyLedgerPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const { caseId } = await searchParams;
  if (!caseId) {
    return (
      <section className="p-8 text-center text-stone-600">
        Missing case.{" "}
        <Link href="/reports/attorney-ledger" className="text-amber-700">
          Pick a case
        </Link>
      </section>
    );
  }

  const supabase = await createClient();
  const ledger = await fetchAttorneyCaseLedger(supabase, caseId);
  if (!ledger) notFound();

  const printed = new Date().toLocaleString("en-US");
  let running = 0;

  return (
    <html lang="en">
      <head>
        <title>Attorney ledger — {ledger.patientName}</title>
        <style>{`
          * { box-sizing: border-box; }
          body { font-family: Georgia, 'Times New Roman', serif; color: #1c1917; margin: 0; padding: 24px 32px; font-size: 10pt; }
          h1 { font-size: 16pt; margin: 0 0 4px; }
          .meta { font-size: 9pt; color: #57534e; margin-bottom: 16px; }
          .carrier { margin: 20px 0 8px; font-weight: 700; font-size: 11pt; border-bottom: 2px solid #b45309; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 12px; }
          th, td { border: 1px solid #d6d3d1; padding: 5px 7px; text-align: left; }
          th { background: #fafaf9; text-transform: uppercase; font-size: 8pt; }
          .num { text-align: right; font-family: ui-monospace, monospace; }
          .sub { background: #fffbeb; font-weight: 600; }
          .grand { border: 2px solid #b45309; padding: 10px 14px; margin-top: 16px; display: flex; justify-content: space-between; }
          .no-print { margin-bottom: 12px; }
          .letterhead { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
          .letterhead img { width: 64px; height: 64px; object-fit: contain; }
          @media print { .no-print { display: none !important; } body { padding: 12px; } }
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
          <h1>Attorney account ledger</h1>
        </div>
        <p className="meta">
          <strong>{ledger.patientName}</strong>
          <br />
          Case {ledger.caseNumber ?? caseId.slice(0, 8)}
          {ledger.dateOfInjury ? ` · DOI ${fmtDate(ledger.dateOfInjury)}` : ""}
          {ledger.attorneyName ? (
            <>
              <br />
              Attorney: {ledger.attorneyName}
            </>
          ) : null}
          <br />
          Printed: {printed}
        </p>

        {ledger.sections.map((section) => (
          <div key={section.carrierId ?? section.carrierName}>
            <p className="carrier">Insurance: {section.carrierName}</p>
            {section.lines.length === 0 ? (
              <p>No charges on file.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>CPT</th>
                    <th className="num">Units</th>
                    <th className="num">Charge</th>
                    <th className="num">Payment</th>
                    <th className="num">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {section.lines.map((line) => {
                    running += line.charge - line.payment;
                    return (
                      <tr key={line.id}>
                        <td>{fmtDate(line.serviceDate)}</td>
                        <td>
                          {line.cpt_code ?? "—"}
                          {line.modifier ? `-${line.modifier}` : ""}
                        </td>
                        <td className="num">{line.units}</td>
                        <td className="num">{fmtMoney(line.charge)}</td>
                        <td className="num">{fmtMoney(line.payment)}</td>
                        <td className="num">{fmtMoney(running)}</td>
                      </tr>
                    );
                  })}
                  <tr className="sub">
                    <td colSpan={3}>
                      {section.carrierName} subtotal
                    </td>
                    <td className="num">{fmtMoney(section.totalCharges)}</td>
                    <td className="num">{fmtMoney(section.totalPayments)}</td>
                    <td className="num">{fmtMoney(section.balance)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        ))}

        <div className="grand">
          <strong>Account balance (charges − payments)</strong>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "12pt" }}>
            {fmtMoney(ledger.balance)}
          </span>
        </div>

        <p className="meta" style={{ marginTop: 16 }}>
          This report is for attorney / lien review — not a CMS-1500 claim. Post
          payments under Billing → Post insurance payment.
        </p>
      </body>
    </html>
  );
}
