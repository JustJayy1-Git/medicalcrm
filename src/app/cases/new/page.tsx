import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ATTORNEY_PICKER_SELECT } from "@/lib/attorney";
import { CARRIER_PICKER_SELECT } from "@/lib/insurance-carrier";
import { CaseForm } from "./case-form";

export const dynamic = "force-dynamic";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; error?: string }>;
}) {
  const supabase = await createClient();
const { patient: patientId, error } = await searchParams;
  if (!patientId) redirect("/patients");

  const [
    { data: patient },
    { data: carriers },
    { data: attorneys },
    { data: providers },
    { data: facilities },
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("id, first_name, last_name, chart_number")
      .eq("id", patientId)
      .maybeSingle(),
    supabase
      .from("insurance_carriers")
      .select(CARRIER_PICKER_SELECT)
      .order("sort_rank")
      .order("name"),
    supabase
      .from("attorneys")
      .select(ATTORNEY_PICKER_SELECT)
      .order("attorney_name"),
    supabase
      .from("providers")
      .select("id, full_name, credentials")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("facilities")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (!patient) notFound();

  return (
    <div className="px-6 py-4 max-w-[1400px] mx-auto">
        <div className="mb-4">
          <Link
            href={`/patients/${patient.id}`}
            className="text-xs text-vice-muted hover:text-eggplant-900"
          >
            ← {patient.last_name}, {patient.first_name}
            {patient.chart_number ? ` · ${patient.chart_number}` : ""}
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2 mb-0.5">
            New case
          </p>
          <h1 className="text-2xl font-serif font-semibold text-eggplant-900">
            Open a case for {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-vice-muted text-sm mt-1">
            Capture the accident dynamics, pain inventory, and billing path now
            — you can fill in the rest later.
          </p>
        </div>

        <CaseForm
          patientId={patient.id}
          patientName={`${patient.first_name} ${patient.last_name}`}
          carriers={carriers ?? []}
          attorneys={attorneys ?? []}
          providers={providers ?? []}
          facilities={facilities ?? []}
          errorMsg={error ?? null}
        />
      </div>
);
}
