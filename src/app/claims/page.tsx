import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  const supabase = await createClient();
return (
    <section className="px-6 py-6 max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mb-1">
          Claims
        </p>
        <h1 className="text-2xl font-serif font-semibold text-eggplant-900 mb-2">
          CMS-1500 / HCFA claims
        </h1>
        <p className="text-sm text-eggplant-700 mb-6">
          Generate health insurance claim forms from your transaction entry data.
          Patient, policy, diagnosis, and procedure lines populate automatically.
        </p>
        <Link
          href="/reports/cms-1500"
          className="inline-flex rounded-md bg-neon-pink px-4 py-2 text-sm font-medium text-white hover:bg-eggplant-800"
        >
          Print CMS-1500 claim form
        </Link>
        <p className="text-xs text-vice-muted mt-4">
          Or open <Link href="/reports" className="text-neon-pink hover:underline">Reports</Link> for
          all billing printouts.
        </p>
      </section>
);
}
