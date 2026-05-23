import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { PatientFilesPanel } from "@/components/patient-files-panel";
import { isPortalPlaceholderPatient } from "@/lib/patient-placeholder";
import { PatientTabs } from "./patient-tabs";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US");
}

const STATUS_PILL: Record<string, string> = {
  open: "bg-neon-mint-100 text-eggplant-800 border-neon-mint-100",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_hold: "bg-neon-mint-100 text-eggplant-700 border-vice-border",
  settled: "bg-sky-100 text-sky-700 border-sky-200",
  closed: "bg-neon-mint-100 text-vice-muted border-vice-border",
  denied: "bg-red-100 text-red-700 border-red-200",
};

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: pageError } = await searchParams;
  const supabase = await createClient();
const { data: patient, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !patient) notFound();

  const isPlaceholder = isPortalPlaceholderPatient(patient.first_name, patient.last_name);
  const displayName = `${patient.last_name}, ${patient.first_name}`;

  const { data: cases } = await supabase
    .from("cases")
    .select(
      "id, case_number, case_type, status, date_of_injury, billing_method, primary_carrier_id, attorney_id, description, pain_level",
    )
    .eq("patient_id", id)
    .order("date_of_injury", { ascending: false });

  const { data: attachments } = await supabase
    .from("case_attachments")
    .select("id, kind, label, mime_type, size_bytes, created_at, case_id")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  const defaultCaseId =
    cases?.find((c) => c.status === "open" || c.status === "active")?.id ??
    cases?.[0]?.id ??
    null;

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-1">
              Patient {patient.chart_number ? `· ${patient.chart_number}` : ""}
            </p>
            <h1 className="text-3xl font-serif font-semibold text-eggplant-900">
              {patient.last_name}, {patient.first_name}
              {patient.preferred_name ? ` (${patient.preferred_name})` : ""}
            </h1>
            <p className="text-sm text-vice-muted mt-1">
              DOB: {fmtDate(patient.date_of_birth)} · Phone:{" "}
              {patient.phone_cell ?? patient.phone ?? "—"} ·{" "}
              <span className="text-emerald-700 font-medium">
                {patient.status}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DeletePatientButton patientId={id} patientName={displayName} />
            <Link
              href={`/patients/${id}/edit`}
              className="px-3 py-1.5 text-xs border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
            >
              ✏️ Edit patient
            </Link>
            <Link
              href="/patients"
              className="text-sm text-vice-muted hover:text-eggplant-900"
            >
              ← Back to all
            </Link>
          </div>
        </div>

        {isPlaceholder ? (
          <p className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            This is an unfinished iPad intake placeholder — not a real patient yet. You can{" "}
            <strong>Delete patient</strong> to remove it, or finish the forms on the iPad.
          </p>
        ) : null}

        {pageError ? (
          <p className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {decodeURIComponent(pageError)}
          </p>
        ) : null}

        {/* Tabs */}
        <PatientTabs
          overview={<OverviewTab patient={patient} />}
          cases={
            <CasesTab
              patientId={id}
              cases={cases ?? []}
            />
          }
          files={
            <PatientFilesPanel
              patientId={id}
              defaultCaseId={defaultCaseId}
              initial={attachments ?? []}
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
        <div className="lg:col-span-3 p-5 rounded-xl bg-white border border-vice-border shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neon-pink mb-2">
            Notes
          </h2>
          <p className="text-sm text-eggplant-800 whitespace-pre-wrap">
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
        <h2 className="text-sm font-semibold text-eggplant-800">
          {cases.length} {cases.length === 1 ? "case" : "cases"}
        </h2>
        <Link
          href={`/cases/new?patient=${patientId}`}
          className="px-4 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm transition-colors"
        >
          + New case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-dashed border-vice-border text-center">
          <p className="text-vice-muted text-sm mb-4">
            No cases for this patient yet.
          </p>
          <Link
            href={`/cases/new?patient=${patientId}`}
            className="text-neon-pink hover:text-eggplant-800 font-medium text-sm"
          >
            ➜ Open a new case
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-vice-border overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neon-mint-100 text-eggplant-700 uppercase text-xs tracking-wider">
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
            <tbody className="divide-y divide-vice-border">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-vice-surface">
                  <td className="px-4 py-2">
                    <Link
                      href={`/cases/${c.id}`}
                      className="text-neon-pink hover:text-eggplant-800 font-mono text-xs font-medium"
                    >
                      {c.case_number ?? c.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 capitalize text-eggplant-800">
                    {c.case_type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-2 text-eggplant-700">
                    {fmtDate(c.date_of_injury)}
                  </td>
                  <td className="px-4 py-2 text-eggplant-700">
                    {c.pain_level !== null ? `${c.pain_level}/10` : "—"}
                  </td>
                  <td className="px-4 py-2 text-eggplant-700 capitalize">
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
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-vice-muted hover:text-neon-pink hover:bg-neon-mint-100 transition-colors"
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
    <div className="p-5 rounded-xl bg-white border border-vice-border shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neon-pink mb-3">
        {title}
      </h2>
      <dl className="space-y-2">
        {data.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <dt className="text-vice-muted">{k}</dt>
            <dd className="text-eggplant-900 text-right truncate ml-3">
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
    <div className="p-10 rounded-xl bg-white border border-dashed border-vice-border text-center">
      <p className="text-eggplant-900 font-medium">{title}</p>
      <p className="text-vice-muted text-sm mt-1">{hint}</p>
    </div>
  );
}
