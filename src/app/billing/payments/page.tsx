import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { lineAmount } from "@/lib/charge-ledger";
import { fmtMoney } from "@/lib/cpt";
import { postChargePayment } from "./actions";

export const dynamic = "force-dynamic";

export default async function PostPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string; error?: string }>;
}) {
  const { caseId, error: queryError } = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: cases } = await supabase
    .from("cases")
    .select(
      `id, case_number,
       patient:patients(last_name, first_name)`,
    )
    .order("updated_at", { ascending: false })
    .limit(80);

  let openLines: {
    id: string;
    cpt_code: string | null;
    units: number;
    fee: number;
    paid: number;
    balance: number;
    visit_date: string;
  }[] = [];

  let caseLabel = "";

  if (caseId) {
    const { data: c } = await supabase
      .from("cases")
      .select(
        `id, case_number,
         patient:patients(last_name, first_name)`,
      )
      .eq("id", caseId)
      .maybeSingle();

    if (c) {
      const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
      caseLabel = patient
        ? `${patient.last_name}, ${patient.first_name} · ${c.case_number ?? ""}`
        : (c.case_number ?? caseId.slice(0, 8));

      const { data: visits } = await supabase
        .from("visits")
        .select(
          `visit_date,
           charges(id, cpt_code, units, fee, paid, balance)`,
        )
        .eq("case_id", caseId)
        .order("visit_date", { ascending: true });

      openLines = (visits ?? []).flatMap((v) =>
        (v.charges ?? [])
          .filter((ch) => Number(ch.balance ?? 0) > 0)
          .map((ch) => ({
            id: ch.id,
            cpt_code: ch.cpt_code,
            units: ch.units,
            fee: Number(ch.fee),
            paid: Number(ch.paid ?? 0),
            balance: Number(ch.balance ?? 0),
            visit_date: v.visit_date,
          })),
      );
    }
  }

  return (
    <section className="px-6 py-6 max-w-3xl">
      <Link href="/billing" className="text-xs text-vice-muted hover:text-eggplant-900">
        ← Billing
      </Link>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-1">
        Payment entry
      </p>
      <h1 className="text-2xl font-serif font-semibold text-eggplant-900 mb-2">
        Post insurance payment
      </h1>
      <p className="text-sm text-eggplant-700 mb-4">
        Apply a payer amount to one charge line.
      </p>
      <p className="text-sm mb-6">
        <Link
          href={caseId ? `/billing/payments/batch?caseId=${caseId}` : "/billing/payments/batch"}
          className="text-neon-pink font-medium hover:underline"
        >
          Batch payment (one check → many lines) →
        </Link>
      </p>

      <form method="get" className="mb-6">
        <label className="block text-sm font-medium text-eggplant-800 mb-1">
          Case
          <select
            name="caseId"
            defaultValue={caseId ?? ""}
            className="mt-1 w-full px-3 py-2 border border-vice-border rounded-lg bg-white text-sm"
          >
            <option value="">Select case…</option>
            {(cases ?? []).map((row) => {
              const patient = Array.isArray(row.patient)
                ? row.patient[0]
                : row.patient;
              const label = patient
                ? `${patient.last_name}, ${patient.first_name}`
                : row.case_number ?? row.id.slice(0, 8);
              return (
                <option key={row.id} value={row.id}>
                  {label}
                  {row.case_number ? ` · ${row.case_number}` : ""}
                </option>
              );
            })}
          </select>
        </label>
        <button
          type="submit"
          className="mt-2 px-3 py-1.5 text-sm border border-vice-border rounded-md hover:bg-vice-surface"
        >
          Load open charges
        </button>
      </form>

      {queryError && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {queryError}
        </p>
      )}

      {caseId && (
        <>
          <p className="text-sm font-medium text-eggplant-900 mb-3">{caseLabel}</p>
          {openLines.length === 0 ? (
            <p className="text-sm text-vice-muted">No open balances on this case.</p>
          ) : (
            <ul className="space-y-4">
              {openLines.map((line) => (
                <li
                  key={line.id}
                  className="p-4 rounded-xl border border-vice-border bg-white"
                >
                  <p className="text-sm text-eggplant-900 mb-2">
                    {line.visit_date} · {line.cpt_code ?? "—"} · Charged{" "}
                    {fmtMoney(lineAmount(line))} · Paid {fmtMoney(line.paid)} ·{" "}
                    <strong>Due {fmtMoney(line.balance)}</strong>
                  </p>
                  <form action={postChargePayment} className="flex flex-wrap gap-2 items-end">
                    <input type="hidden" name="charge_id" value={line.id} />
                    <input type="hidden" name="case_id" value={caseId} />
                    <label className="text-xs text-eggplant-700">
                      Amount
                      <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={line.balance}
                        defaultValue={line.balance}
                        className="block mt-0.5 w-28 px-2 py-1 border border-vice-border rounded text-sm"
                      />
                    </label>
                    <label className="text-xs text-eggplant-700">
                      Paid date
                      <input
                        name="paid_date"
                        type="date"
                        defaultValue={today}
                        className="block mt-0.5 px-2 py-1 border border-vice-border rounded text-sm"
                      />
                    </label>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm bg-neon-mint text-eggplant-900 font-medium rounded-md hover:bg-neon-mint"
                    >
                      Post payment
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
