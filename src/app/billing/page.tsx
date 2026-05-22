import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createClient();

  const { data: openCharges } = await supabase
    .from("charges")
    .select("balance")
    .gt("balance", 0)
    .limit(500);

  const openBalance = (openCharges ?? []).reduce(
    (s, row) => s + Number(row.balance ?? 0),
    0,
  );

  return (
    <section className="px-6 py-6 max-w-3xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mb-1">
        Billing
      </p>
      <h1 className="text-2xl font-serif font-semibold text-eggplant-900 mb-2">
        Billing & A/R
      </h1>
      <p className="text-sm text-eggplant-700 mb-4">
        Post insurance payments against charge lines (Medisoft payment entry). Balances
        feed the attorney ledger and future aging reports.
      </p>

      <div className="mb-6 p-4 rounded-xl border border-neon-mint-100 bg-neon-mint-100/60">
        <p className="text-xs uppercase tracking-wider text-eggplant-800 mb-1">
          Open A/R (on file)
        </p>
        <p className="text-2xl font-mono font-semibold text-eggplant-900">
          ${openBalance.toFixed(2)}
        </p>
        <p className="text-xs text-vice-muted mt-1">
          Sum of charge balances with amount still due.
        </p>
      </div>

      <ul className="space-y-3 text-sm">
        <li>
          <Link
            href="/billing/payments/batch"
            className="text-neon-pink font-medium hover:underline"
          >
            Batch payment (one check)
          </Link>
          <span className="text-vice-muted block mt-0.5 text-xs">
            Distribute a payer check across multiple charge lines
          </span>
        </li>
        <li>
          <Link
            href="/billing/payments"
            className="text-neon-pink font-medium hover:underline"
          >
            Single-line payment
          </Link>
          <span className="text-vice-muted block mt-0.5 text-xs">
            Apply amount to one charge line
          </span>
        </li>
        <li>
          <Link href="/cases" className="text-neon-pink font-medium hover:underline">
            Cases → Transaction entry
          </Link>
          <span className="text-vice-muted"> — enter charges per treatment day</span>
        </li>
        <li>
          <Link
            href="/reports/cms-1500"
            className="text-neon-pink font-medium hover:underline"
          >
            Reports → CMS-1500
          </Link>
          <span className="text-vice-muted"> — print to insurance</span>
        </li>
        <li>
          <Link
            href="/reports/ar-aging"
            className="text-neon-pink font-medium hover:underline"
          >
            Reports → A/R aging
          </Link>
          <span className="text-vice-muted"> — 30/60/90 by carrier</span>
        </li>
        <li>
          <Link
            href="/reports/attorney-ledger"
            className="text-neon-pink font-medium hover:underline"
          >
            Reports → Attorney ledger
          </Link>
          <span className="text-vice-muted"> — print for counsel</span>
        </li>
      </ul>
    </section>
  );
}
