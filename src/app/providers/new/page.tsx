import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProviderForm } from "../provider-form";
import { createProvider } from "../actions";

export default async function NewProviderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
const { error } = await searchParams;
  const errorMsg =
    error === "missing_name" ? "Full name is required." : error;

  return (
    <section className="px-6 py-4 max-w-4xl mx-auto">
        <Link
          href="/providers"
          className="text-xs text-vice-muted hover:text-eggplant-900"
        >
          ← Back to providers
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-0.5">
          New provider
        </p>
        <h1 className="text-xl font-serif font-semibold text-eggplant-900 mb-4">
          Add a clinician
        </h1>

        <ProviderForm
          action={createProvider}
          cancelHref="/providers"
          errorMsg={errorMsg ?? null}
          submitLabel="Save provider"
        />
      </section>
);
}
