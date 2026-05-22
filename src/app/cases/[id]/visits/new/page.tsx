import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewVisitForm } from "./new-visit-form";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id: caseId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
const { data: c } = await supabase
    .from("cases")
    .select(
      `id, description, case_number, date_of_injury, diagnosis_codes,
       patient:patients(id, first_name, last_name),
       facility:facilities!cases_facility_id_fkey(id, name)`,
    )
    .eq("id", caseId)
    .maybeSingle();

  if (!c) notFound();

  const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
  const [{ data: providers }, { data: cptCodes }] = await Promise.all([
    supabase
      .from("providers")
      .select("id, full_name, credentials")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("cpt_codes")
      .select("code, description, default_fee")
      .eq("is_active", true)
      .order("code")
      .limit(500),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="px-6 py-4 max-w-3xl mx-auto">
        <Link href={`/cases/${caseId}`} className="text-xs text-vice-muted hover:text-eggplant-900">
          ← Back to case
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mt-2">
          Transaction entry
        </p>
        <h1 className="text-xl font-serif font-semibold text-eggplant-900 mb-1">
          {patient
            ? `${patient.last_name}, ${patient.first_name}`
            : "Case charges"}
        </h1>
        <p className="text-sm text-vice-muted mb-4">
          Post CPT charges for one treatment day. Same date merges into one visit
          for CMS-1500 billing.
        </p>

        <NewVisitForm
          caseId={caseId}
          patientId={patient?.id ?? ""}
          defaultVisitDate={today}
          providers={providers ?? []}
          cptCodes={cptCodes ?? []}
          diagnosisCodes={
            Array.isArray(c.diagnosis_codes) ? (c.diagnosis_codes as string[]) : []
          }
          errorMsg={error ?? null}
        />
      </section>
);
}
