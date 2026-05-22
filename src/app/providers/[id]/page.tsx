import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProviderForm } from "../provider-form";
import { updateProvider } from "../actions";

export const dynamic = "force-dynamic";

function displayName(fullName: string, credentials: string | null) {
  if (!credentials?.trim()) return fullName;
  return `${fullName}, ${credentials.trim()}`;
}

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
const { data: provider } = await supabase
    .from("providers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!provider) notFound();

  const errorMsg =
    error === "missing_name" ? "Full name is required." : error ?? null;

  return (
    <section className="px-6 py-4 max-w-4xl mx-auto">
        <Link
          href="/providers"
          className="text-xs text-vice-muted hover:text-eggplant-900"
        >
          ← Back to providers
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-0.5">
          Provider
        </p>
        <h1 className="text-xl font-serif font-semibold text-eggplant-900 mb-4">
          {displayName(provider.full_name, provider.credentials)}
        </h1>

        <ProviderForm
          action={updateProvider}
          provider={provider}
          cancelHref="/providers"
          errorMsg={errorMsg}
          submitLabel="Save changes"
        />
      </section>
);
}
