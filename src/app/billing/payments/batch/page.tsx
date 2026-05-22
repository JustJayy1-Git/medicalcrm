import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { lineAmount } from "@/lib/charge-ledger";
import { fmtMoney } from "@/lib/cpt";
import { BatchPaymentForm, type OpenChargeLine } from "./batch-payment-form";

export const dynamic = "force-dynamic";

export default async function BatchPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    caseId?: string;
    error?: string;
    ok?: string;
    total?: string;
    ref?: string;
  }>;
}) {
  const params = await searchParams;
  const { caseId, error, ok, total, ref } = params;
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

  let openLines: OpenChargeLine[] = [];
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
            visit_date: v.visit_date,
            cpt_code: ch.cpt_code,
            balance: Number(ch.balance ?? 0),
            charged: `Charged ${fmtMoney(lineAmount({ fee: ch.fee, units: ch.units }))}`,
          })),
      );
    }
  }

  return (
    <section className="px-6 py-6 max-w-4xl">
      <Link href="/billing" className="text-xs text-vice-muted hover:text-eggplant-900">
        ← Billing
      </Link>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-1">
        Batch payment
      </p>
      <h1 className="text-2xl font-serif font-semibold text-eggplant-900 mb-2">
        Post one check to multiple lines
      </h1>
      <p className="text-sm text-eggplant-700 mb-4">
        Enter the payer check amount, then distribute across open charges (oldest
        service dates first). Updates A/R aging and the attorney ledger.
      </p>
      <p className="text-sm mb-6">
        <Link href="/billing/payments" className="text-neon-pink hover:underline">
          Single-line payment entry →
        </Link>
      </p>

      <form method="get" className="mb-6 flex flex-wrap gap-2 items-end">
        <label className="text-sm font-medium text-eggplant-800">
          Case
          <select
            name="caseId"
            defaultValue={caseId ?? ""}
            className="mt-1 block w-full min-w-[240px] px-3 py-2 border border-vice-border rounded-lg bg-white text-sm"
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
          className="px-3 py-2 text-sm border border-vice-border rounded-md hover:bg-vice-surface"
        >
          Load open charges
        </button>
      </form>

      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {ok && total && (
        <p className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Posted {ok} line{ok === "1" ? "" : "s"} · ${total}
          {ref ? ` · Ref ${ref}` : ""}
        </p>
      )}

      {caseId && (
        <>
          <p className="text-sm font-medium text-eggplant-900 mb-4">{caseLabel}</p>
          {openLines.length === 0 ? (
            <p className="text-sm text-vice-muted">No open balances on this case.</p>
          ) : (
            <BatchPaymentForm
              caseId={caseId}
              lines={openLines}
              defaultDate={today}
            />
          )}
        </>
      )}
    </section>
  );
}
