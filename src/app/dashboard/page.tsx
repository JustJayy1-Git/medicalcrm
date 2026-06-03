import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardSnapshot } from "@/lib/dashboard-stats";

export const dynamic = "force-dynamic";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function StatCard({
  label,
  value,
  hint,
  href,
  accent = "cyan",
}: {
  label: string;
  value: string;
  hint: string;
  href?: string;
  accent?: "cyan" | "pink" | "amber";
}) {
  const ring =
    accent === "pink"
      ? "ring-neon-pink/15 hover:ring-neon-pink/30"
      : accent === "amber"
        ? "ring-amber-400/15 hover:ring-amber-400/25"
        : "ring-neon-mint/15 hover:ring-neon-mint/30";

  const inner = (
    <div
      className={`p-5 rounded-xl bg-white border border-vice-border shadow-sm ring-1 transition-all ${ring} ${href ? "hover:shadow-md" : ""}`}
    >
      <p className="text-xs uppercase tracking-wider text-eggplant-500 mb-2">
        {label}
      </p>
      <p className="text-3xl font-semibold text-eggplant-900">{value}</p>
      <p className="text-sm text-eggplant-500 mt-2 leading-snug">{hint}</p>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-mint rounded-xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const stats = await fetchDashboardSnapshot(supabase);
  const { monthly: m } = stats;

  const { data: recentCases } = await supabase
    .from("cases")
    .select(
      `id, case_number, updated_at, status, referral_source,
       patient:patients(last_name, first_name)`,
    )
    .in("status", ["open", "active"])
    .order("updated_at", { ascending: false })
    .limit(8);

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-3">
        Dashboard
      </p>
      <h1 className="text-3xl font-serif font-semibold text-eggplant-900 mb-1">
        Practice overview
      </h1>
      <p className="text-eggplant-500 mb-8 max-w-2xl">
        Active treatment and billing at a glance, plus how many new cases came in
        this month and where referrals are coming from.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard
          accent="cyan"
          label="Active patients treating"
          value={String(stats.activePatientsTreating)}
          hint={`${stats.openActiveCases} open / active case${stats.openActiveCases === 1 ? "" : "s"}`}
          href="/cases"
        />
        <StatCard
          accent="amber"
          label="Pending billing to send"
          value={String(stats.unbilledChargeCount)}
          hint={
            stats.unbilledChargeCount > 0
              ? `${money(stats.unbilledChargeTotal)} unbilled · CMS-1500`
              : "No unbilled charges — all caught up"
          }
          href="/reports/cms-1500"
        />
        <StatCard
          accent="pink"
          label="Billed — awaiting payment"
          value={String(stats.billedAwaitingPaymentCount)}
          hint={
            stats.billedAwaitingPaymentCount > 0
              ? `${money(stats.billedAwaitingPaymentBalance)} open after billing`
              : "Nothing outstanding on billed lines"
          }
          href="/reports/ar-aging"
        />
        <StatCard
          accent="cyan"
          label={`New cases — ${m.monthLabel}`}
          value={String(m.newCases)}
          hint={`${m.newPatients} new patient chart${m.newPatients === 1 ? "" : "s"} opened`}
          href="/cases"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          label={`Patients seen — ${m.monthLabel}`}
          value={String(m.patientsSeen)}
          hint={`${m.visitCount} completed visit${m.visitCount === 1 ? "" : "s"} this month`}
          href="/cases"
        />
        <StatCard
          accent="amber"
          label={`Referrals recorded — ${m.monthLabel}`}
          value={String(m.referralsRecorded)}
          hint={
            m.referralsRecorded > 0
              ? `${m.referralBreakdown.length} source${m.referralBreakdown.length === 1 ? "" : "s"} · see breakdown below`
              : "Add “Referred by” on intake or case"
          }
        />
      </div>

      <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-eggplant-900">
              Referral sources — {m.monthLabel}
            </h2>
            <p className="text-sm text-eggplant-500 mt-1">
              New cases opened this month, grouped by how they heard about Pro Injury
              (from iPad intake or case “Referred by”).
            </p>
          </div>
          <p className="text-sm text-eggplant-600">
            <span className="font-semibold text-eggplant-900">{m.newCases}</span> new
            cases
          </p>
        </div>

        {m.referralBreakdown.length === 0 ? (
          <p className="text-sm text-eggplant-400">
            No referral source recorded for new cases this month yet. It is captured
            on the HIPAA intake form and the case edit screen under{" "}
            <span className="font-medium">Referred by</span>.
          </p>
        ) : (
          <ul className="space-y-3">
            {m.referralBreakdown.map((row) => {
              const pct =
                m.referralsRecorded > 0
                  ? Math.round((row.count / m.referralsRecorded) * 100)
                  : 0;
              return (
                <li key={row.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-eggplant-800">{row.label}</span>
                    <span className="text-eggplant-500">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-vice-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-mint to-neon-pink"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm">
          <h2 className="text-lg font-semibold text-eggplant-900 mb-2">
            Quick links
          </h2>
          <ul className="text-sm text-eggplant-700 space-y-2">
            <li>
              <Link href="/patients/new" className="text-neon-pink hover:underline font-medium">
                Add patient
              </Link>
            </li>
            <li>
              <Link href="/intake-packets" className="text-neon-pink hover:underline font-medium">
                Review iPad intake packets
              </Link>
            </li>
            <li>
              <Link href="/cases" className="text-neon-pink hover:underline font-medium">
                Cases → transaction entry
              </Link>
            </li>
            <li>
              <Link href="/reports/cms-1500" className="text-neon-pink hover:underline font-medium">
                Print CMS-1500 (send billing)
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm">
          <h2 className="text-lg font-semibold text-eggplant-900 mb-2">
            Active cases
          </h2>
          {(recentCases ?? []).length === 0 ? (
            <p className="text-sm text-eggplant-400">No open or active cases.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {recentCases!.map((row) => {
                const patient = Array.isArray(row.patient)
                  ? row.patient[0]
                  : row.patient;
                const label = patient
                  ? `${patient.last_name}, ${patient.first_name}`
                  : "Case";
                const ref = row.referral_source
                  ? ` · ${String(row.referral_source).slice(0, 24)}`
                  : "";
                return (
                  <li key={row.id}>
                    <Link
                      href={`/cases/${row.id}`}
                      className="text-neon-pink hover:underline font-medium"
                    >
                      {label}
                    </Link>
                    <span className="text-eggplant-500 text-xs ml-2">
                      {row.case_number ?? row.status}
                      {ref}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
