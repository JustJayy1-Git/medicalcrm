import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { EditPatientForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditPatientPage({
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

  const [{ data: patient }, { data: providers }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("providers")
      .select("id, full_name, credentials")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  if (!patient) notFound();

  return (
    <AppShell user={user} active="/patients">
      <div className="px-6 py-4 max-w-[1400px] mx-auto">
        <div className="mb-3">
          <Link
            href={`/patients/${id}`}
            className="text-xs text-stone-500 hover:text-stone-900"
          >
            ← Back to {patient.last_name}, {patient.first_name}
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700 mt-2 mb-0.5">
            Edit patient
          </p>
          <h1 className="text-xl font-serif font-semibold text-stone-900">
            {patient.last_name}, {patient.first_name}
            {patient.chart_number ? ` · ${patient.chart_number}` : ""}
          </h1>
        </div>

        <EditPatientForm
          patient={patient}
          providers={providers ?? []}
          errorMsg={error ?? null}
        />
      </div>
    </AppShell>
  );
}
