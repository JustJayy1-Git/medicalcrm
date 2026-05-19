import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { PatientTabs } from "./patient-tabs";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US");
}

const STATUS_PILL: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_hold: "bg-stone-100 text-stone-600 border-stone-300",
  settled: "bg-sky-100 text-sky-700 border-sky-200",
  closed: "bg-stone-100 text-stone-500 border-stone-300",
  denied: "bg-red-100 text-red-700 border-red-200",
};

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: patient, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !patient) notFound();

  const { data: cases } = await supabase
    .from("cases")
    .select(
      "id, case_number, case_type, status, date_of_injury, billing_method, primary_carrier_id, attorney_id, description, pain_level",
    )
    .eq("patient_id", id)
    .order("date_of_injury", { ascending: false });

  return (
    <AppShell user={user} active="/cases">
      <div className="px-8 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 mb-1">
              Patient {patient.chart_number ? `· ${patient.chart_number}` : ""}
            </p>
            <h1 className="text-3xl font-serif font-semibold text-stone-900">
              {patient.last_name}, {patient.first_name}
              {patient.preferred_name ? ` (${patient.preferred_name})` : ""}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              DOB: {fmtDate(patient.date_of_birth)} · Phone:{" "}
              {patient.phone_cell ?? patient.phone ?? "—"} ·{" "}
              <span className="text-emerald-700 font-medium">
                {patient.status}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/patients/${id}/edit`}
              className="px-3 py-1.5 text-xs border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100"
            >
              ✏️ Edit patient
            </Link>
            <Link
              href="/patients"
              className="text-sm text-stone-500 hover:text-stone-900"
            >
              ← Back to all
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <PatientTabs
          overview={<OverviewTab patient={patient} />}
          cases={
            <CasesTab
              patientId={id}
              cases={cases ?? []}
            />
          }
          visits={
            <Empty
              title="No visits yet"
              hint="Once visits are logged, they'll appear here."
            />
          }
          billing={
            <Empty
              title="Billing coming soon"
              hint="Ledger, claims, and statements will live here."
            />
          }
        />
      </div>
    </AppShell>
  );
}

// =================================================
// Overview
// =================================================
function OverviewTab({
  patient,
}: {
  patient: Record<string, string | null | boolean | undefined>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Info
        title="Contact"
        data={[
          ["Cell", patient.phone_cell as string | null],
          ["Home", patient.phone_home as string | null],
          ["Work", patient.phone_work as string | null],
          ["Email", patient.email as string | null],
        ]}
      />
      <Info
        title="Address"
        data={[
          ["Line 1", patient.address_line1 as string | null],
          ["Line 2", patient.address_line2 as string | null],
          ["City", patient.city as string | null],
          [
            "State / Zip",
            [patient.state, patient.zip].filter(Boolean).join(" "),
          ],
        ]}
      />
      <Info
        title="Identity"
        data={[
          ["DOB", patient.date_of_birth as string | null],
          ["Sex", patient.sex as string | null],
          [
            "SSN",
            patient.ssn_last4 ? `***-**-${patient.ssn_last4}` : null,
          ],
          ["Language", patient.language as string | null],
        ]}
      />
      {patient.notes && (
        <div className="lg:col-span-3 p-5 rounded-xl bg-white border border-stone-200 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700 mb-2">
            Notes
          </h2>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">
            {patient.notes as string}
          </p>
        </div>
      )}
    </div>
  );
}

// =================================================
// Cases
// =================================================
function CasesTab({
  patientId,
  cases,
}: {
  patientId: string;
  cases: {
    id: string;
    case_number: string | null;
    case_type: string;
    status: string;
    date_of_injury: string | null;
    billing_method: string;
    description: string | null;
    pain_level: number | null;
  }[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-stone-700">
          {cases.length} {cases.length === 1 ? "case" : "cases"}
        </h2>
        <Link
          href={`/cases/new?patient=${patientId}`}
          className="px-4 py-2 text-sm bg-gradient-to-b from-amber-400 to-amber-600 text-stone-900 font-semibold rounded-md hover:from-amber-300 hover:to-amber-500 shadow-sm transition-colors"
        >
          + New case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-dashed border-stone-300 text-center">
          <p className="text-stone-500 text-sm mb-4">
            No cases for this patient yet.
          </p>
          <Link
            href={`/cases/new?patient=${patientId}`}
            className="text-amber-700 hover:text-amber-800 font-medium text-sm"
          >
            ➜ Open a new case
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Case #</th>
                <th className="text-left px-4 py-2 font-medium">Type</th>
                <th className="text-left px-4 py-2 font-medium">DOI</th>
                <th className="text-left px-4 py-2 font-medium">Pain</th>
                <th className="text-left px-4 py-2 font-medium">Billing</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/cases/${c.id}`}
                      className="text-amber-700 hover:text-amber-800 font-mono text-xs font-medium"
                    >
                      {c.case_number ?? c.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 capitalize text-stone-700">
                    {c.case_type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-2 text-stone-600">
                    {fmtDate(c.date_of_injury)}
                  </td>
                  <td className="px-4 py-2 text-stone-600">
                    {c.pain_level !== null ? `${c.pain_level}/10` : "—"}
                  </td>
                  <td className="px-4 py-2 text-stone-600 capitalize">
                    {c.billing_method}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-xs border capitalize",
                        STATUS_PILL[c.status] ?? STATUS_PILL.closed,
                      ].join(" ")}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/cases/${c.id}/edit`}
                      title="Edit case"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      ✏️
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =================================================
// Building blocks
// =================================================
function Info({
  title,
  data,
}: {
  title: string;
  data: [string, string | null | undefined][];
}) {
  return (
    <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700 mb-3">
        {title}
      </h2>
      <dl className="space-y-2">
        {data.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <dt className="text-stone-500">{k}</dt>
            <dd className="text-stone-900 text-right truncate ml-3">
              {v || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="p-10 rounded-xl bg-white border border-dashed border-stone-300 text-center">
      <p className="text-stone-800 font-medium">{title}</p>
      <p className="text-stone-500 text-sm mt-1">{hint}</p>
    </div>
  );
}
