import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CarrierForm } from "../carrier-form";
import { createCarrier } from "../actions";

export default async function NewCarrierPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
const { error } = await searchParams;
  const errorMsg =
    error === "missing_name" ? "Name is required." : error;

  return (
    <div className="px-6 py-4 max-w-4xl mx-auto">
        <div className="mb-3">
          <Link
            href="/insurance"
            className="text-xs text-vice-muted hover:text-eggplant-900"
          >
            ← Back to carriers
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-0.5">
            New carrier
          </p>
          <h1 className="text-xl font-serif font-semibold text-eggplant-900">
            Add an insurance carrier
          </h1>
        </div>

        <CarrierForm
          action={createCarrier}
          cancelHref="/insurance"
          errorMsg={errorMsg ?? null}
          submitLabel="Save carrier"
        />
      </div>
);
}
