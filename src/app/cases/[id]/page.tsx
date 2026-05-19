import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

function fmt(d: string | null | undefined) {
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

export default async function CasePage({
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

  const patient = c.patient;

  return (
    <AppShell user={user} active="/cases">
      <div className="px-6 py-4 max-w-6xl mx-auto">
        {/* Patient banner — always visible */}
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

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700 mb-1">
              Case · {c.case_number ?? c.id.slice(0, 8)}
            </p>
            <h1 className="text-2xl font-sans font-semibold text-stone-900 tabular-nums">
              {c.description ??
                c.case_type.replace("_", " ").toUpperCase()}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              DOI: {fmt(c.date_of_injury)} · First visit:{" "}
              {fmt(c.date_of_first_visit)} · Billing:{" "}
              <span className="capitalize">{c.billing_method}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/cases/${c.id}/edit`}
              className="px-3 py-1.5 text-xs border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100"
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
              <p className="text-[11px] text-stone-500 mb-1">Locations</p>
              <div className="flex flex-wrap gap-1.5">
                {(c.pain_locations ?? []).length === 0 && (
                  <span className="text-stone-400 text-sm">—</span>
                )}
                {(c.pain_locations ?? []).map((loc: string) => (
                  <span
                    key={loc}
                    className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-800 border border-amber-200 capitalize"
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
                    : "bg-stone-100 text-stone-500 border-stone-300",
                ].join(" ")}
              >
                {c.lop_signed ? "LOP signed" : "LOP not signed"}
              </span>
              {c.lop_signed_date && (
                <span className="text-xs text-stone-500">
                  {fmt(c.lop_signed_date)}
                </span>
              )}
            </div>
          </Card>

          {c.notes && (
            <div className="lg:col-span-2">
              <Card title="Notes">
                <p className="text-sm text-stone-700 whitespace-pre-wrap">
                  {c.notes}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppShell>
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
    <section className="p-5 rounded-xl bg-white border border-stone-200 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700 mb-3">
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
      <p className="text-[11px] text-stone-500 mb-0.5">{label}</p>
      <p
        className={[
          "text-sm text-stone-900",
          capitalize ? "capitalize" : "",
          value ? "" : "text-stone-400",
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
    <div className="flex items-center justify-between text-xs px-2 py-1 rounded border border-stone-200 bg-stone-50">
      <span className="text-stone-600">{label}</span>
      <span
        className={[
          "font-medium",
          value === true
            ? "text-emerald-700"
            : value === false
            ? "text-stone-500"
            : "text-stone-400",
        ].join(" ")}
      >
        {value === true ? "Yes" : value === false ? "No" : "—"}
      </span>
    </div>
  );
}
