import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchCaseClaimOptions } from "@/lib/cms1500/fetch";
import { ClaimPicker } from "./claim-picker";

export const dynamic = "force-dynamic";

export default async function Cms1500ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const supabase = await createClient();
  const { caseId: initialCaseId } = await searchParams;
  const cases = await fetchCaseClaimOptions(supabase);

  return (
    <section className="px-6 py-6 max-w-2xl">
        <Link href="/reports" className="text-xs text-vice-muted hover:text-eggplant-900">
          ← Reports
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-1">
          CMS-1500
        </p>
        <h1 className="text-2xl font-serif font-semibold text-eggplant-900 mb-2">
          Health insurance claim form
        </h1>
        <p className="text-sm text-eggplant-700 mb-6">
          One printed form per treatment day (date of service), using your blank
          CMS-1500 PDF with fields overlaid. Up to 6 CPT codes in box 24 per day
          (e.g. day 1 may be only 99203; later days may have six therapy codes).
        </p>

        <ClaimPicker cases={cases} initialCaseId={initialCaseId} />

        <p className="text-xs text-vice-muted mt-6">
          Set practice billing address and NPI in{" "}
          <code className="text-[11px]">.env.local</code> (
          <code className="text-[11px]">NEXT_PUBLIC_PRACTICE_*</code>). Carrier
          mailing address comes from{" "}
          <Link href="/insurance" className="text-neon-pink hover:underline">
            Insurance carriers
          </Link>
          . Assign facility and policy on the case edit screen.
        </p>
      </section>
);
}
