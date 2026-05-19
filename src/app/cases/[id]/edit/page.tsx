import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { EditCaseForm, type CaseRow } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditCasePage({
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

  const [
    { data: c },
    { data: carriers },
    { data: attorneys },
    { data: providers },
    { data: facilities },
    { data: attachments },
  ] = await Promise.all([
    supabase
      .from("cases")
      .select(
        `*,
         patient:patients(id, first_name, last_name, chart_number)`,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("insurance_carriers").select("id, name").order("name"),
    supabase
      .from("attorneys")
      .select("id, attorney_name, firm_name")
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
    supabase
      .from("case_attachments")
      .select("id, kind, label, mime_type, size_bytes, created_at")
      .eq("case_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!c) notFound();

  const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;

  return (
    <AppShell user={user} active="/cases">
      <div className="px-6 py-4 max-w-[1400px] mx-auto">
        {/* Patient banner — always visible so you never lose context */}
        {patient && (
          <div className="mb-3 flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-700">
                Patient
              </p>
              <Link
                href={`/patients/${patient.id}`}
                className="text-base font-semibold text-stone-900 hover:text-amber-800"
              >
                {patient.last_name}, {patient.first_name}
                {patient.chart_number ? (
                  <span className="text-stone-500 font-mono text-xs ml-2">
                    {patient.chart_number}
                  </span>
                ) : null}
              </Link>
            </div>
            <Link
              href={`/patients/${patient.id}`}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium"
            >
              Open patient →
            </Link>
          </div>
        )}

        <div className="mb-3">
          <Link
            href={`/cases/${id}`}
            className="text-xs text-stone-500 hover:text-stone-900"
          >
            ← Back to case
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700 mt-2 mb-0.5">
            Edit case
          </p>
          <h1 className="text-xl font-sans font-semibold text-stone-900 tabular-nums">
            {c.case_number ?? id.slice(0, 8)} · {c.description ?? "(no name)"}
          </h1>
        </div>

        <EditCaseForm
          c={c as CaseRow}
          patientId={patient?.id ?? ""}
          patientName={
            patient ? `${patient.first_name} ${patient.last_name}` : "—"
          }
          carriers={carriers ?? []}
          attorneys={attorneys ?? []}
          providers={providers ?? []}
          facilities={facilities ?? []}
          attachments={attachments ?? []}
          errorMsg={error ?? null}
        />
      </div>
    </AppShell>
  );
}
