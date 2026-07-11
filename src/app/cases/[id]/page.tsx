import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CaseChargeLedger } from "@/components/case-charge-ledger";
import { fetchCaseLedger } from "@/lib/charge-ledger-server";
import { sendCaseToNpFollowUp } from "./followup-action";
import { syncTherapyBilling } from "./therapy-billing-action";

export const dynamic = "force-dynamic";

function fmt(d: string | null | undefined) {
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

export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ billing_sync?: string }>;
}) {
  const { id } = await params;
  const { billing_sync: billingSync } = await searchParams;
  const supabase = await createClient();
const { data: c } = await supabase
    .from("cases")
    .select(
      `*,
       patient:patients(id, first_name, last_name, chart_number, date_of_birth, phone_cell, phone, email),
       carrier:insurance_carriers!cases_primary_carrier_id_fkey(id, name, phone, payer_id),
       attorney:attorneys(id, attorney_name, firm_name, phone, email)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!c) notFound();

  const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
  if (!patient) notFound();

  const ledger = await fetchCaseLedger(supabase, id);

  // Care-stage snapshot: NP consultation + therapy activity.
  const { data: consult } = await supabase
    .from("clinical_consultations")
    .select("status, visit_kind, completed_at")
    .eq("case_id", id)
    .maybeSingle();
  const { count: therapySessionCount } = await supabase
    .from("therapy_sessions")
    .select("id", { count: "exact", head: true })
    .eq("case_id", id);
  const { data: therapyConsent } = await supabase
    .from("therapy_consents")
    .select("signed_at")
    .eq("case_id", id)
    .maybeSingle();
  const { data: intakePacket } = await supabase
    .from("intake_packets")
    .select("id, status")
    .eq("case_id", id)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="px-6 py-4 max-w-6xl mx-auto">
        {/* Patient banner — always visible */}
        <div className="mb-3 flex items-center justify-between p-3 rounded-lg bg-neon-mint-100 border border-neon-mint-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neon-pink">
              Patient
            </p>
            <Link
              href={`/patients/${patient.id}`}
              className="text-base font-semibold text-eggplant-900 hover:text-eggplant-800"
            >
              {patient.last_name}, {patient.first_name}
              {patient.chart_number ? (
                <span className="text-vice-muted font-mono text-xs ml-2">
                  {patient.chart_number}
                </span>
              ) : null}
            </Link>
          </div>
          <Link
            href={`/patients/${patient.id}`}
            className="text-xs text-neon-pink hover:text-eggplant-800 font-medium"
          >
            Open patient →
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mb-1">
              Case · {c.case_number ?? c.id.slice(0, 8)}
            </p>
            <h1 className="text-2xl font-sans font-semibold text-eggplant-900 tabular-nums">
              {c.description ??
                c.case_type.replace("_", " ").toUpperCase()}
            </h1>
            <p className="text-sm text-vice-muted mt-1">
              DOI: {fmt(c.date_of_injury)} · First visit:{" "}
              {fmt(c.date_of_first_visit)} · Billing:{" "}
              <span className="capitalize">{c.billing_method}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/cases/${c.id}/print/consultation`}
              className="px-3 py-1.5 text-xs border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
              title="Print NP consultation packet (Initial Evaluation, EMC, No-Fault)"
            >
              🖨 Consultation
            </Link>
            <Link
              href={`/cases/${c.id}/print/therapy`}
              className="px-3 py-1.5 text-xs border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
              title="Print therapy record (consent + session log)"
            >
              🖨 Therapy
            </Link>
            <form action={sendCaseToNpFollowUp}>
              <input type="hidden" name="case_id" value={c.id} />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs border border-gold/50 text-eggplant-800 rounded-md hover:bg-gold-soft font-medium"
                title="Put this patient back in the nurse practitioner queue"
              >
                🩺 NP follow-up
              </button>
            </form>
            <Link
              href={`/cases/${c.id}/visits/new`}
              className="px-3 py-1.5 text-xs bg-neon-pink text-white rounded-md hover:bg-eggplant-800 font-medium"
            >
              Transaction entry
            </Link>
            <Link
              href={`/cases/${c.id}/edit`}
              className="px-3 py-1.5 text-xs border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
            >
              ✏️ Edit case
            </Link>
            <span
              className={[
                "px-3 py-1 rounded-full text-xs border capitalize font-medium",
                STATUS_PILL[c.status] ?? STATUS_PILL.closed,
              ].join(" ")}
            >
              {c.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Care progress — intake → NP → therapy */}
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-gold/30 bg-gold-soft/40 px-4 py-2.5 text-xs">
          <span className="font-bold uppercase tracking-wider text-eggplant-700">
            Care progress
          </span>
          <span className="text-eggplant-800">
            NP consultation:{" "}
            {consult ? (
              consult.status === "completed" ? (
                <strong className="text-emerald-700">
                  Completed{consult.completed_at
                    ? ` ${new Date(consult.completed_at).toLocaleDateString("en-US")}`
                    : ""}
                </strong>
              ) : (
                <strong className="text-amber-700 capitalize">
                  {String(consult.status).replace("_", " ")}
                  {consult.visit_kind === "follow_up" ? " (follow-up)" : ""}
                </strong>
              )
            ) : (
              <strong className="text-vice-muted">Not queued</strong>
            )}
          </span>
          <span className="text-eggplant-800">
            Therapy sessions: <strong>{therapySessionCount ?? 0}</strong>
          </span>
          <form action={syncTherapyBilling} className="ml-auto">
            <input type="hidden" name="case_id" value={c.id} />
            <button
              type="submit"
              className="px-2.5 py-1 text-[11px] border border-gold/50 text-eggplant-800 rounded-md hover:bg-gold-soft font-medium"
              title="Re-run billing capture for every saved therapy note on this case (skips anything already billed)"
            >
              ⟳ Sync therapy billing
            </button>
          </form>
        </div>

        {billingSync ? (
          <p
            className={`mb-4 rounded-lg border px-4 py-2.5 text-xs font-medium ${
              billingSync === "failed"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {billingSync === "failed"
              ? "Therapy billing sync failed — check that migrations are applied, or enter charges via Transaction entry."
              : `Therapy billing synced: ${billingSync.replace("-of-", " new charge line(s) from ")} therapy note(s). Already-billed codes were skipped.`}
          </p>
        ) : null}

        {/* Patient folder — every signed document, viewable & printable */}
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-vice-border bg-white px-4 py-2.5 text-xs shadow-sm">
          <span className="font-bold uppercase tracking-wider text-eggplant-700">
            Patient folder
          </span>
          {intakePacket ? (
            <>
              <Link
                href={`/intake-packets/${intakePacket.id}`}
                className="text-neon-pink hover:underline font-medium"
              >
                Intake packet
              </Link>
              <Link
                href={`/intake-packets/${intakePacket.id}/print`}
                className="text-eggplant-700 hover:text-neon-pink"
              >
                🖨 Print intake
              </Link>
            </>
          ) : (
            <span className="text-vice-muted">Intake packet: none linked</span>
          )}
          <Link
            href={`/cases/${c.id}/print/consultation`}
            className="text-eggplant-700 hover:text-neon-pink"
          >
            🖨 NP consultation (No-Fault · Initial Eval · EMC)
          </Link>
          <Link
            href={`/cases/${c.id}/print/therapy`}
            className="text-eggplant-700 hover:text-neon-pink"
          >
            🖨 Therapy record{" "}
            {therapyConsent?.signed_at ? "(consent ✓" : "(consent pending"}
            {` · ${therapySessionCount ?? 0} sessions)`}
          </Link>
        </div>

        <section className="mb-4">
          <CaseChargeLedger caseId={c.id} ledger={ledger} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* What happened */}
          <Card title="What happened">
            <Row label="Description" value={c.description} />
            <Row label="How it happened" value={c.how_it_happened} />
            <Row
              label="At fault"
              value={c.fault?.replace("_", " ")}
              capitalize
            />
            <Row label="Fault notes" value={c.fault_notes} />
            <Row label="Police report #" value={c.police_report_num} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <YesNo label="Airbag deployed" value={c.airbag_deployed} />
              <YesNo label="Seatbelt worn" value={c.seatbelt_worn} />
              <YesNo label="Loss of consciousness" value={c.loss_consciousness} />
              <YesNo label="Ambulance to scene" value={c.ambulance} />
              <YesNo label="ER visit" value={c.er_visit} />
            </div>
            {c.er_visit && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Row label="ER facility" value={c.er_visit_facility} />
                <Row label="ER date" value={fmt(c.er_visit_date)} />
              </div>
            )}
          </Card>

          {/* Pain inventory */}
          <Card title="Pain inventory">
            <Row
              label="Pain level"
              value={c.pain_level !== null ? `${c.pain_level} / 10` : null}
            />
            <div>
              <p className="text-[11px] text-vice-muted mb-1">Locations</p>
              <div className="flex flex-wrap gap-1.5">
                {(c.pain_locations ?? []).length === 0 && (
                  <span className="text-vice-muted text-sm">—</span>
                )}
                {(c.pain_locations ?? []).map((loc: string) => (
                  <span
                    key={loc}
                    className="px-2 py-0.5 rounded-full text-xs bg-neon-mint-100 text-eggplant-800 border border-neon-mint-100 capitalize"
                  >
                    {loc.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
            <Row label="Pain notes" value={c.pain_notes} />
          </Card>

          {/* Insurance */}
          <Card title="Insurance (primary)">
            <Row label="Carrier" value={c.carrier?.name} />
            <Row label="Claim #" value={c.primary_claim_number} />
            <Row label="Policy #" value={c.primary_policy_number} />
            <Row label="Adjuster" value={c.primary_adjuster_name} />
            <Row label="Adjuster phone" value={c.primary_adjuster_phone} />
            <Row label="Adjuster email" value={c.primary_adjuster_email} />
          </Card>

          {/* Attorney */}
          <Card title="Attorney (LOP)">
            <Row label="Attorney" value={c.attorney?.attorney_name} />
            <Row label="Firm" value={c.attorney?.firm_name} />
            <Row label="Phone" value={c.attorney?.phone} />
            <Row label="Email" value={c.attorney?.email} />
            <div className="flex items-center gap-3 pt-2">
              <span
                className={[
                  "px-2 py-0.5 rounded-full text-xs border",
                  c.lop_signed
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-neon-mint-100 text-vice-muted border-vice-border",
                ].join(" ")}
              >
                {c.lop_signed ? "LOP signed" : "LOP not signed"}
              </span>
              {c.lop_signed_date && (
                <span className="text-xs text-vice-muted">
                  {fmt(c.lop_signed_date)}
                </span>
              )}
            </div>
          </Card>

          {c.notes && (
            <div className="lg:col-span-2">
              <Card title="Notes">
                <p className="text-sm text-eggplant-800 whitespace-pre-wrap">
                  {c.notes}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
);
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-5 rounded-xl bg-white border border-vice-border shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neon-pink mb-3">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string | null | undefined;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] text-vice-muted mb-0.5">{label}</p>
      <p
        className={[
          "text-sm text-eggplant-900",
          capitalize ? "capitalize" : "",
          value ? "" : "text-vice-muted",
        ].join(" ")}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function YesNo({
  label,
  value,
}: {
  label: string;
  value: boolean | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between text-xs px-2 py-1 rounded border border-vice-border bg-vice-surface">
      <span className="text-eggplant-700">{label}</span>
      <span
        className={[
          "font-medium",
          value === true
            ? "text-emerald-700"
            : value === false
            ? "text-vice-muted"
            : "text-vice-muted",
        ].join(" ")}
      >
        {value === true ? "Yes" : value === false ? "No" : "—"}
      </span>
    </div>
  );
}
