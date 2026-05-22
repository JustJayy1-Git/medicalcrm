import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FacilityForm } from "../facility-form";
import { createFacility } from "../actions";

export default async function NewFacilityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
const { error } = await searchParams;
  const errorMsg =
    error === "missing_name" ? "Name is required." : error;

  return (
    <section className="px-6 py-4 max-w-4xl mx-auto">
        <Link
          href="/facilities"
          className="text-xs text-vice-muted hover:text-eggplant-900"
        >
          ← Back to facilities
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-0.5">
          New facility
        </p>
        <h1 className="text-xl font-serif font-semibold text-eggplant-900 mb-4">
          Add a clinic location
        </h1>

        <FacilityForm
          action={createFacility}
          cancelHref="/facilities"
          errorMsg={errorMsg ?? null}
          submitLabel="Save facility"
        />
      </section>
);
}
