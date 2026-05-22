import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FacilityForm } from "../facility-form";
import { updateFacility } from "../actions";

export const dynamic = "force-dynamic";

export default async function FacilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
const { data: facility } = await supabase
    .from("facilities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!facility) notFound();

  const errorMsg =
    error === "missing_name" ? "Name is required." : error ?? null;

  return (
    <section className="px-6 py-4 max-w-4xl mx-auto">
        <Link
          href="/facilities"
          className="text-xs text-vice-muted hover:text-eggplant-900"
        >
          ← Back to facilities
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-0.5">
          Facility
        </p>
        <h1 className="text-xl font-serif font-semibold text-eggplant-900 mb-4">
          {facility.name}
        </h1>

        <FacilityForm
          action={updateFacility}
          facility={facility}
          cancelHref="/facilities"
          errorMsg={errorMsg}
          submitLabel="Save changes"
        />
      </section>
);
}
