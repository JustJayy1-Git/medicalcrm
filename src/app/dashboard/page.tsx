import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = todayIso();

  const [
    { count: patientCount },
    { count: caseCount },
    { count: openCases },
    { count: todayVisits },
    { data: recentCases },
    { data: openCharges },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("cases").select("*", { count: "exact", head: true }),
    supabase
      .from("cases")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "active"]),
    supabase
      .from("visits")
      .select("*", { count: "exact", head: true })
      .eq("visit_date", today),
    supabase
      .from("cases")
      .select(
        `id, case_number, updated_at, status,
         patient:patients(last_name, first_name)`,
      )
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase.from("charges").select("balance").gt("balance", 0).limit(500),
  ]);

  const openAr = (openCharges ?? []).reduce(
    (s, row) => s + Number(row.balance ?? 0),
    0,
  );

  const stats = [
    { label: "Total patients", value: patientCount ?? 0 },
    { label: "Total cases", value: caseCount ?? 0 },
    { label: "Open / active cases", value: openCases ?? 0 },
    { label: "Today's visits", value: todayVisits ?? 0 },
  ];

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-3">
        Dashboard
      </p>
      <h1 className="text-3xl font-serif font-semibold text-eggplant-900 mb-1">
        Hey there 👋
      </h1>
      <p className="text-eggplant-500 mb-8">
        Live practice snapshot · Open A/R ${openAr.toFixed(2)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-xl bg-white border border-vice-border shadow-sm ring-1 ring-neon-pink/10"
          >
            <p className="text-xs uppercase tracking-wider text-eggplant-500 mb-2">
              {s.label}
            </p>
            <p className="text-3xl font-semibold text-eggplant-900">{s.value}</p>
          </div>
        ))}
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
              <Link href="/cases" className="text-neon-pink hover:underline font-medium">
                Cases → transaction entry
              </Link>
            </li>
            <li>
              <Link href="/reports/cms-1500" className="text-neon-pink hover:underline font-medium">
                CMS-1500 (insurance)
              </Link>
            </li>
            <li>
              <Link
                href="/reports/attorney-ledger"
                className="text-neon-pink hover:underline font-medium"
              >
                Attorney ledger
              </Link>
            </li>
            <li>
              <Link href="/billing" className="text-neon-pink hover:underline font-medium">
                Billing & payments
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm">
          <h2 className="text-lg font-semibold text-eggplant-900 mb-2">
            Recent cases
          </h2>
          {(recentCases ?? []).length === 0 ? (
            <p className="text-sm text-eggplant-400">No cases yet.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {recentCases!.map((row) => {
                const patient = Array.isArray(row.patient)
                  ? row.patient[0]
                  : row.patient;
                const label = patient
                  ? `${patient.last_name}, ${patient.first_name}`
                  : "Case";
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
