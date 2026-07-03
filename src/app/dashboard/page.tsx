import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
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
      className={`lux-card p-4 rounded-xl bg-white border border-vice-border shadow-sm ring-1 ${ring}`}
    >
      <p className="text-[10px] uppercase tracking-wider text-eggplant-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-eggplant-900 tabular-nums">{value}</p>
      <p className="text-xs text-eggplant-500 mt-1 leading-snug">{hint}</p>
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
  const { monthly: m, ytdPayments: ytd } = stats;

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
      <p className="text-eggplant-500 mb-6 max-w-2xl">
        Treatment and billing at a glance, plus year-to-date payments and new-case
        referrals this month.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard
          accent="cyan"
          label="Active patients treating"
          value={String(stats.activePatientsTreating)}
          hint={`${stats.openActiveCases} open / active cases`}
          href="/cases"
        />
        <StatCard
          accent="amber"
          label="Pending billing to send"
          value={String(stats.unbilledChargeCount)}
          hint={
            stats.unbilledChargeCount > 0
              ? `${money(stats.unbilledChargeTotal)} unbilled`
              : "All caught up"
          }
          href="/reports/cms-1500"
        />
        <StatCard
          accent="pink"
          label="Billed — awaiting payment"
          value={String(stats.billedAwaitingPaymentCount)}
          hint={
            stats.billedAwaitingPaymentCount > 0
              ? `${money(stats.billedAwaitingPaymentBalance)} open`
              : "Nothing outstanding"
          }
          href="/reports/ar-aging"
        />
      </div>

      <DashboardCharts
        year={ytd.year}
        ytdTotal={ytd.total}
        ytdByMonth={ytd.byMonth}
        newCases={m.newCases}
        monthLabel={m.monthLabel}
        referralBreakdown={m.referralBreakdown}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lux-card p-6 rounded-xl bg-white border border-vice-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-eggplant-900 mb-2">
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
              <Link href="/billing/payments" className="text-neon-pink hover:underline font-medium">
                Post payments
              </Link>
            </li>
            <li>
              <Link href="/reports/cms-1500" className="text-neon-pink hover:underline font-medium">
                Print CMS-1500 (send billing)
              </Link>
            </li>
          </ul>
        </div>

        <div className="lux-card p-6 rounded-xl bg-white border border-vice-border shadow-sm">
          <h2 className="text-lg font-serif font-semibold text-eggplant-900 mb-2">
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
