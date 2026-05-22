import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CarrierReferencePanel } from "@/components/carrier-picker";
import { CarrierForm } from "../carrier-form";
import { updateCarrier } from "../actions";
import type { InsuranceCarrierPicker } from "@/lib/insurance-carrier";

export const dynamic = "force-dynamic";

export default async function CarrierPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
const { data: carrier } = await supabase
    .from("insurance_carriers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!carrier) notFound();

  const errorMsg =
    error === "missing_name" ? "Name is required." : error ?? null;

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
            Carrier
          </p>
          <h1 className="text-xl font-serif font-semibold text-eggplant-900">
            {carrier.name}
          </h1>
        </div>

        <div className="mb-4">
          <CarrierReferencePanel carrier={carrier as InsuranceCarrierPicker} />
          <p className="text-xs text-vice-muted mt-2">
            This is what staff see when they pick this carrier on a case. Edit
            fields below to update the master record.
          </p>
        </div>

        <CarrierForm
          action={updateCarrier}
          carrier={carrier}
          cancelHref="/insurance"
          errorMsg={errorMsg}
          submitLabel="Save changes"
        />
      </div>
);
}
