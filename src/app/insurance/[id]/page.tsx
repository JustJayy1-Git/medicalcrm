import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { CarrierForm } from "../carrier-form";
import { updateCarrier } from "../actions";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: carrier } = await supabase
    .from("insurance_carriers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!carrier) notFound();

  const errorMsg =
    error === "missing_name" ? "Name is required." : error ?? null;

  return (
    <AppShell user={user} active="/insurance">
      <div className="px-6 py-4 max-w-4xl mx-auto">
        <div className="mb-3">
          <Link
            href="/insurance"
            className="text-xs text-stone-500 hover:text-stone-900"
          >
            ← Back to carriers
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700 mt-2 mb-0.5">
            Carrier
          </p>
          <h1 className="text-xl font-serif font-semibold text-stone-900">
            {carrier.name}
          </h1>
        </div>

        <CarrierForm
          action={updateCarrier}
          carrier={carrier}
          cancelHref="/insurance"
          errorMsg={errorMsg}
          submitLabel="Save changes"
        />
      </div>
    </AppShell>
  );
}
