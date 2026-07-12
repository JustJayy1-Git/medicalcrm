import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { syncTherapyBilling } from "@/app/cases/[id]/therapy-billing-action";
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { PatientFilesPanel } from "@/components/patient-files-panel";
import { parseIcdCodes } from "@/lib/icd";
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
  searchParams: Promise<{ error?: string; tab?: string; billing_sync?: string }>;
}) {
  const { id } = await params;
  const {
    error: pageError,
    tab: tabParam,
    billing_sync: billingSync,
  } = await searchParams;
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

  // Visits, signed documents, and per-case ledgers for the tabs.
  const caseIds = (cases ?? []).map((c) => c.id);
  const caseNumberById = new Map(
    (cases ?? []).map((c) => [c.id, c.case_number ?? c.id.slice(0, 8)]),
  );

  const [{ data: visits }, { data: intakePackets }, { data: therapyConsents }] =
    await Promise.all([
      supabase
        .from("visits")
        .select("id, case_id, visit_date, visit_type, status, notes")
        .eq("patient_id", id)
        .order("visit_date", { ascending: false })
        .limit(200),
      supabase
        .from("intake_packets")
        .select("id, status, case_id")
        .eq("patient_id", id)
        .order("id", { ascending: false }),
      caseIds.length
        ? supabase
            .from("therapy_consents")
            .select("case_id, signed_at")
            .in("case_id", caseIds)
        : Promise.resolve({ data: [] as { case_id: string; signed_at: string | null }[] }),
    ]);

  const { data: chargeRows } = caseIds.length
    ? await supabase
        .from("charges")
        .select(
          `id, case_id, cpt_code, modifier, units, fee, paid, adjustment,
           visit:visits(visit_date)`,
        )
        .in("case_id", caseIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const { data: caseDiags } = caseIds.length
    ? await supabase.from("cases").select("id, diagnosis_codes").in("id", caseIds)
    : { data: [] };
  const diagByCase = new Map(
    (caseDiags ?? []).map((c) => [c.id as string, parseIcdCodes(c.diagnosis_codes)]),
  );

  const validTabs = ["overview", "cases", "files", "visits", "billing"] as const;
  const defaultTab = (validTabs as readonly string[]).includes(tabParam ?? "")
    ? (tabParam as (typeof validTabs)[number])
    : "cases";

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
          defaultTab={defaultTab}
          overview={<OverviewTab patient={patient} />}
          cases={
            <CasesTab
              patientId={id}
              cases={cases ?? []}
            />
          }
          files={
            <div className="space-y-6">
              <SignedDocuments
                intakePackets={intakePackets ?? []}
                caseIds={caseIds}
                caseNumberById={caseNumberById}
                therapyConsents={therapyConsents ?? []}
              />
              <PatientFilesPanel
                patientId={id}
                defaultCaseId={defaultCaseId}
                initial={attachments ?? []}
              />
            </div>
          }
          visits={
            <VisitsTab visits={visits ?? []} caseNumberById={caseNumberById} />
          }
          billing={
            <BillingTab
              patientId={id}
              caseIds={caseIds}
              charges={(chargeRows ?? []) as ChargeRow[]}
              diagByCase={diagByCase}
              caseNumberById={caseNumberById}
              billingSync={billingSync}
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
// Files — every document the patient signed
// =================================================
function SignedDocuments({
  intakePackets,
  caseIds,
  caseNumberById,
  therapyConsents,
}: {
  intakePackets: { id: number; status: string; case_id: string | null }[];
  caseIds: string[];
  caseNumberById: Map<string, string>;
  therapyConsents: { case_id: string; signed_at: string | null }[];
}) {
  const consentByCase = new Map(therapyConsents.map((t) => [t.case_id, t.signed_at]));

  return (
    <div className="p-5 rounded-xl bg-white border border-vice-border shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neon-pink mb-3">
        Signed documents
      </h2>
      <ul className="divide-y divide-neon-mint-100 text-sm">
        {intakePackets.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
            <span className="text-eggplant-900 font-medium">
              Intake packet #{p.id}
              <span className="ml-2 text-xs text-vice-muted capitalize">{p.status}</span>
            </span>
            <span className="flex items-center gap-4">
              <Link
                href={`/intake-packets/${p.id}`}
                className="text-xs text-neon-pink hover:underline font-medium"
              >
                View
              </Link>
              <Link
                href={`/intake-packets/${p.id}/print`}
                target="_blank"
                className="text-xs text-neon-pink hover:underline font-medium"
              >
                🖨 Print
              </Link>
            </span>
          </li>
        ))}
        {intakePackets.length === 0 ? (
          <li className="py-2.5 text-vice-muted">No iPad intake packet on file.</li>
        ) : null}

        {caseIds.map((caseId) => (
          <li key={caseId} className="py-2.5 space-y-1.5">
            <p className="text-xs uppercase tracking-wider text-vice-muted">
              Case {caseNumberById.get(caseId)}
            </p>
            {(
              [
                ["Florida No-Fault (NOFA) — signed notice", "nofa", null],
                ["Notice of Emergency Medical Condition — signed", "emc", null],
                [
                  "Consent for Therapy",
                  "therapy-consent",
                  consentByCase.get(caseId) ?? null,
                ],
              ] as const
            ).map(([label, slug, signedAt]) => (
              <div
                key={slug}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-eggplant-900 font-medium">
                  {label}
                  {slug === "therapy-consent" ? (
                    signedAt ? (
                      <span className="ml-2 text-xs text-emerald-700">
                        ✓ signed {fmtDate(signedAt)}
                      </span>
                    ) : (
                      <span className="ml-2 text-xs text-amber-700">pending</span>
                    )
                  ) : null}
                </span>
                <Link
                  href={`/cases/${caseId}/print/doc/${slug}`}
                  target="_blank"
                  className="text-xs text-neon-pink hover:underline font-medium"
                >
                  🖨 Print
                </Link>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

// =================================================
// Visits — consultations + therapy sheets, printable
// =================================================
const VISIT_TYPE_LABEL: Record<string, string> = {
  eval: "Initial consultation",
  reeval: "Follow-up consultation",
  office: "Therapy session",
  consult: "Consultation",
  discharge: "Discharge",
  tele: "Telehealth",
  other: "Visit",
};

function VisitsTab({
  visits,
  caseNumberById,
}: {
  visits: {
    id: string;
    case_id: string | null;
    visit_date: string;
    visit_type: string | null;
    status: string;
    notes: string | null;
  }[];
  caseNumberById: Map<string, string>;
}) {
  if (visits.length === 0) {
    return (
      <Empty
        title="No visits yet"
        hint="Visits appear automatically when the NP finishes a consultation or the therapist saves a therapy sheet."
      />
    );
  }

  return (
    <div className="rounded-xl border border-vice-border overflow-hidden bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-neon-mint-100 text-eggplant-700 uppercase text-xs tracking-wider">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Date</th>
            <th className="text-left px-4 py-2 font-medium">Type</th>
            <th className="text-left px-4 py-2 font-medium">Case</th>
            <th className="text-right px-4 py-2 font-medium">Record</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-vice-border">
          {visits.map((v) => {
            const isConsult = v.visit_type === "eval" || v.visit_type === "reeval";
            return (
              <tr key={v.id} className="hover:bg-vice-surface">
                <td className="px-4 py-2 font-medium text-eggplant-900">
                  {fmtDate(v.visit_date)}
                </td>
                <td className="px-4 py-2 text-eggplant-800">
                  {VISIT_TYPE_LABEL[v.visit_type ?? "other"] ?? "Visit"}
                </td>
                <td className="px-4 py-2 text-eggplant-700">
                  {v.case_id ? caseNumberById.get(v.case_id) ?? "—" : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  {v.case_id ? (
                    <Link
                      href={
                        v.visit_type === "reeval"
                          ? `/cases/${v.case_id}/print/doc/follow-up`
                          : isConsult
                            ? `/cases/${v.case_id}/print/doc/initial-evaluation`
                            : `/cases/${v.case_id}/print/doc/therapy-sessions`
                      }
                      target="_blank"
                      className="text-xs text-neon-pink hover:underline font-medium"
                    >
                      🖨 Print{" "}
                      {v.visit_type === "reeval"
                        ? "follow-up report"
                        : isConsult
                          ? "initial evaluation"
                          : "therapy sheets"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =================================================
// Billing — Medisoft-style transaction grid + HICFA prints
// =================================================
type ChargeRow = {
  id: string;
  case_id: string | null;
  cpt_code: string | null;
  modifier: string | null;
  units: number | null;
  fee: number | string | null;
  paid: number | string | null;
  adjustment: number | string | null;
  visit: { visit_date: string } | { visit_date: string }[] | null;
};

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BillingTab({
  patientId,
  caseIds,
  charges,
  diagByCase,
  caseNumberById,
  billingSync,
}: {
  patientId: string;
  caseIds: string[];
  charges: ChargeRow[];
  diagByCase: Map<string, string[]>;
  caseNumberById: Map<string, string>;
  billingSync?: string;
}) {
  if (caseIds.length === 0) {
    return (
      <Empty
        title="No billing yet"
        hint="Charges appear automatically when the NP finishes a consultation or the therapist saves a therapy sheet."
      />
    );
  }

  return (
    <div className="space-y-8">
      {billingSync ? (
        <p
          className={`rounded-lg border px-4 py-2.5 text-xs font-medium ${
            billingSync === "failed"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {billingSync === "failed"
            ? "Therapy billing sync failed — check migrations, or enter charges via Transaction entry."
            : `Therapy billing synced: ${billingSync.replace("-of-", " new charge line(s) from ")} therapy note(s).`}
        </p>
      ) : null}

      {caseIds.map((caseId) => {
        const rows = charges
          .filter((c) => c.case_id === caseId)
          .map((c) => {
            const visit = Array.isArray(c.visit) ? c.visit[0] : c.visit;
            const units = Number(c.units ?? 1);
            const amount = Number(c.fee ?? 0);
            return {
              id: c.id,
              date: visit?.visit_date ?? "",
              cpt: c.cpt_code ?? "",
              modifier: c.modifier ?? "",
              units,
              amount,
              total: amount * units,
              paid: Number(c.paid ?? 0),
              adjustment: Number(c.adjustment ?? 0),
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date) || a.cpt.localeCompare(b.cpt));

        const diags = diagByCase.get(caseId) ?? [];
        const serviceDates = [...new Set(rows.map((r) => r.date).filter(Boolean))];
        const accountTotal = rows.reduce((s, r) => s + r.total, 0);
        const paidTotal = rows.reduce((s, r) => s + r.paid + r.adjustment, 0);

        // Aging on the open balance, Medisoft buckets.
        const buckets = [0, 0, 0, 0];
        const now = Date.now();
        for (const r of rows) {
          const open = r.total - r.paid - r.adjustment;
          if (!(open > 0) || !r.date) continue;
          const days = Math.max(
            0,
            Math.floor((now - new Date(`${r.date}T12:00:00`).getTime()) / 86400000),
          );
          const idx = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3;
          buckets[idx] += open;
        }

        return (
          <div key={caseId}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="text-sm font-semibold text-eggplant-800">
                Case {caseNumberById.get(caseId)} — Transaction entry
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  href={`/cases/${caseId}/visits/new`}
                  className="px-2.5 py-1 text-[11px] border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100 font-medium"
                >
                  + New transaction
                </Link>
                <form action={syncTherapyBilling}>
                  <input type="hidden" name="case_id" value={caseId} />
                  <input type="hidden" name="patient_id" value={patientId} />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-[11px] border border-gold/50 text-eggplant-800 rounded-md hover:bg-gold-soft font-medium"
                    title="Re-run billing capture for every saved therapy note (skips anything already billed)"
                  >
                    ⟳ Sync therapy billing
                  </button>
                </form>
              </div>
            </div>

            {/* Print claims per date of service */}
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-eggplant-700">
                Print claim:
              </span>
              {serviceDates.map((d) => (
                <Link
                  key={d}
                  href={`/reports/cms-1500/print?caseId=${encodeURIComponent(caseId)}&dos=${encodeURIComponent(d)}`}
                  target="_blank"
                  className="px-2 py-0.5 rounded-md border border-vice-border text-neon-pink hover:bg-neon-mint-100 font-medium"
                >
                  🖨 {fmtDate(d)}
                </Link>
              ))}
              {serviceDates.length > 1 ? (
                <Link
                  href={`/reports/cms-1500/print?caseId=${encodeURIComponent(caseId)}&all=1`}
                  target="_blank"
                  className="px-2 py-0.5 rounded-md border border-gold/50 text-eggplant-800 hover:bg-gold-soft font-medium"
                >
                  🖨 All days
                </Link>
              ) : null}
              {serviceDates.length === 0 ? (
                <span className="text-vice-muted">no charges yet</span>
              ) : null}
            </div>

            {rows.length === 0 ? (
              <p className="p-6 rounded-xl bg-white border border-dashed border-vice-border text-sm text-vice-muted text-center">
                No charges on this case yet.
              </p>
            ) : (
              <div className="rounded-xl border border-vice-border overflow-x-auto bg-white shadow-sm">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead className="bg-neon-mint-100 text-eggplant-700 uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Date</th>
                      <th className="text-left px-3 py-2 font-medium">Procedure</th>
                      <th className="text-left px-3 py-2 font-medium">Mod</th>
                      <th className="text-right px-3 py-2 font-medium">Units</th>
                      <th className="text-right px-3 py-2 font-medium">Amount</th>
                      <th className="text-right px-3 py-2 font-medium">Total</th>
                      <th className="text-left px-3 py-2 font-medium">Diag 1</th>
                      <th className="text-left px-3 py-2 font-medium">Diag 2</th>
                      <th className="text-left px-3 py-2 font-medium">Diag 3</th>
                      <th className="text-left px-3 py-2 font-medium">Diag 4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neon-mint-100">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-vice-surface tabular-nums">
                        <td className="px-3 py-1.5 text-eggplant-900 font-medium">
                          {fmtDate(r.date)}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-eggplant-900">{r.cpt}</td>
                        <td className="px-3 py-1.5 text-eggplant-700">{r.modifier}</td>
                        <td className="px-3 py-1.5 text-right">{r.units}</td>
                        <td className="px-3 py-1.5 text-right">{money(r.amount)}</td>
                        <td className="px-3 py-1.5 text-right font-medium">
                          {money(r.total)}
                        </td>
                        {[0, 1, 2, 3].map((i) => (
                          <td key={i} className="px-3 py-1.5 font-mono text-eggplant-700">
                            {diags[i] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-vice-border bg-vice-surface font-medium">
                    <tr className="tabular-nums">
                      <td className="px-3 py-2" colSpan={5}>
                        Aging — 0-30: ${money(buckets[0])} · 31-60: ${money(buckets[1])} ·
                        61-90: ${money(buckets[2])} · 91+: ${money(buckets[3])}
                      </td>
                      <td className="px-3 py-2 text-right" colSpan={5}>
                        Payments: ${money(paidTotal)} · Account Total:{" "}
                        <strong>${money(accountTotal)}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}
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
