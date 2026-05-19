import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import {
  CPT_PICKER_SELECT,
  MULTILINK_TEMPLATE_SELECT,
  AUTH_VISIT_CAP,
  type CptCode,
  type MultilinkTemplate,
  type MultilinkTemplateLine,
} from "@/lib/cpt";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load case + patient context, providers list, CPT codes, templates,
  // and the highest existing visit_number so we can suggest "N of 23".
  const [
    caseQ,
    providersQ,
    cptQ,
    templatesQ,
    templateLinesQ,
    maxVisitQ,
  ] = await Promise.all([
    supabase
      .from("cases")
      .select(
        `id, case_number, accident_date, status, primary_carrier_id, attorney_id,
         patient:patients(id, first_name, last_name, chart_number, date_of_birth)`,
      )
      .eq("id", caseId)
      .maybeSingle(),
    supabase
      .from("providers")
      .select("id, full_name, credentials")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("cpt_codes")
      .select(CPT_PICKER_SELECT)
      .eq("is_active", true)
      .order("category")
      .order("code"),
    supabase
      .from("multilink_templates")
      .select(MULTILINK_TEMPLATE_SELECT)
      .eq("is_active", true)
      .order("sort_rank"),
    supabase
      .from("multilink_template_lines")
      .select(
        "id, template_id, line_number, cpt_code, units, fee_per_unit, modifier, notes",
      )
      .order("template_id")
      .order("line_number"),
    supabase
      .from("visits")
      .select("visit_number")
      .eq("case_id", caseId)
      .order("visit_number", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const c = caseQ.data;
  if (!c) notFound();
  const patient = c.patient;

  const providers = providersQ.data ?? [];
  const cpt: CptCode[] = (cptQ.data ?? []) as CptCode[];
  const templates: MultilinkTemplate[] =
    (templatesQ.data ?? []) as MultilinkTemplate[];
  const templateLines: MultilinkTemplateLine[] =
    (templateLinesQ.data ?? []) as MultilinkTemplateLine[];

  const nextVisitNumber = (maxVisitQ.data?.visit_number ?? 0) + 1;
  const approachingCap = nextVisitNumber >= AUTH_VISIT_CAP - 2;
  const overCap = nextVisitNumber > AUTH_VISIT_CAP;

  // Group templates with their lines for client-side template expansion
  const templatesWithLines = templates.map((t) => ({
    ...t,
    lines: templateLines.filter((l) => l.template_id === t.id),
  }));

  return (
    <AppShell user={user} active="/cases">
      <div className="px-6 py-4 max-w-[1400px] mx-auto">
        {/* Patient + case banner */}
        <div className="mb-3 flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-700">
              Patient / Case
            </p>
            <div className="text-base font-semibold text-stone-900">
              {patient.last_name}, {patient.first_name}
              {patient.chart_number ? (
                <span className="text-stone-500 font-mono text-xs ml-2">
                  {patient.chart_number}
                </span>
              ) : null}
              <span className="text-stone-400 mx-2">·</span>
              <Link
                href={`/cases/${c.id}`}
                className="text-amber-700 hover:text-amber-800 font-mono text-sm"
              >
                Case {c.case_number ?? c.id.slice(0, 8)}
              </Link>
            </div>
          </div>
          <Link
            href={`/cases/${c.id}`}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium"
          >
            ← Back to case
          </Link>
        </div>

        {/* Header */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700 mb-0.5">
            Transaction entry
          </p>
          <h1 className="text-2xl font-serif font-semibold text-stone-900">
            New visit — charges
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Visit{" "}
            <span
              className={
                overCap
                  ? "font-semibold text-red-700"
                  : approachingCap
                    ? "font-semibold text-amber-700"
                    : "font-semibold text-stone-900"
              }
            >
              {nextVisitNumber}
            </span>{" "}
            of {AUTH_VISIT_CAP} authorized.
            {overCap ? (
              <span className="ml-2 text-red-700">
                ⚠️ Over the standard auth cap. Confirm additional authorization
                before billing.
              </span>
            ) : approachingCap ? (
              <span className="ml-2 text-amber-700">
                Approaching the {AUTH_VISIT_CAP}-visit cap.
              </span>
            ) : null}
          </p>
        </div>

        {error ? (
          <div className="mb-3 p-2 rounded border border-red-300 bg-red-50 text-red-800 text-sm">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <NewVisitForm
          caseId={c.id}
          patientId={patient.id}
          nextVisitNumber={nextVisitNumber}
          providers={providers}
          cpt={cpt}
          templates={templatesWithLines}
        />
      </div>
    </AppShell>
  );
}
