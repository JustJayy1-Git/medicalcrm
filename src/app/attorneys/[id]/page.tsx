import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AttorneyReferencePanel } from "@/components/attorney-picker";
import { AttorneyForm } from "../attorney-form";
import { updateAttorney } from "../actions";
import type { AttorneyPicker } from "@/lib/attorney";

export const dynamic = "force-dynamic";

export default async function AttorneyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
const { data: attorney } = await supabase
    .from("attorneys")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!attorney) notFound();

  const errorMsg =
    error === "missing_name" ? "Attorney name is required." : error ?? null;

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
            Attorney
          </p>
          <h1 className="text-xl font-serif font-semibold text-eggplant-900">
            {attorney.attorney_name}
            {attorney.firm_name ? ` · ${attorney.firm_name}` : ""}
          </h1>
        </div>

        <div className="mb-4">
          <AttorneyReferencePanel attorney={attorney as AttorneyPicker} />
          <p className="text-xs text-vice-muted mt-2">
            This is what staff see when they pick this attorney on a case. Edit
            fields below to update the master record.
          </p>
        </div>

        <AttorneyForm
          action={updateAttorney}
          attorney={attorney}
          cancelHref="/attorneys"
          errorMsg={errorMsg}
          submitLabel="Save changes"
        />
      </div>
);
}
