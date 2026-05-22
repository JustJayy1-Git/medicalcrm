import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AttorneyForm } from "../attorney-form";
import { createAttorney } from "../actions";

export default async function NewAttorneyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
const { error } = await searchParams;
  const errorMsg =
    error === "missing_name" ? "Attorney name is required." : error;

  return (
    <div className="px-6 py-4 max-w-4xl mx-auto">
        <div className="mb-3">
          <Link
            href="/attorneys"
            className="text-xs text-vice-muted hover:text-eggplant-900"
          >
            ← Back to attorneys
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-0.5">
            New attorney
          </p>
          <h1 className="text-xl font-serif font-semibold text-eggplant-900">
            Add a referral attorney
          </h1>
        </div>

        <AttorneyForm
          action={createAttorney}
          cancelHref="/attorneys"
          errorMsg={errorMsg ?? null}
          submitLabel="Save attorney"
        />
      </div>
);
}
