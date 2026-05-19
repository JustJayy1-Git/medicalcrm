import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { CarrierForm } from "../carrier-form";
import { createCarrier } from "../actions";

export default async function NewCarrierPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;
  const errorMsg =
    error === "missing_name" ? "Name is required." : error;

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
            New carrier
          </p>
          <h1 className="text-xl font-serif font-semibold text-stone-900">
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
    </AppShell>
  );
}
