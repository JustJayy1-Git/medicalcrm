import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchCaseLedgerOptions } from "@/lib/attorney-ledger-server";
import { AttorneyLedgerCasePicker } from "./case-picker";

export const dynamic = "force-dynamic";

export default async function AttorneyLedgerReportPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const supabase = await createClient();
  const { caseId: initialCaseId } = await searchParams;
  const cases = await fetchCaseLedgerOptions(supabase);

  return (
    <section className="px-6 py-6 max-w-2xl">
      <Link href="/reports" className="text-xs text-vice-muted hover:text-eggplant-900">
        ← Reports
      </Link>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-1">
        Attorney ledger
      </p>
      <h1 className="text-2xl font-serif font-semibold text-eggplant-900 mb-2">
        Account ledger (attorney copy)
      </h1>
      <p className="text-sm text-eggplant-700 mb-6">
        Medisoft-style ledger: charges and insurance payments by carrier — not
        CMS-1500 claim forms. Use this when counsel needs balances and payment
        history.
      </p>

      <AttorneyLedgerCasePicker cases={cases} initialCaseId={initialCaseId} />
    </section>
  );
}
