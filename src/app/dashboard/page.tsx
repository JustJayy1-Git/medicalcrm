import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ count: patientCount }, { count: caseCount }, { count: openCases }] =
    await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("cases").select("*", { count: "exact", head: true }),
      supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "active"]),
    ]);

  const stats = [
    { label: "Total patients", value: patientCount ?? 0 },
    { label: "Total cases", value: caseCount ?? 0 },
    { label: "Open / active cases", value: openCases ?? 0 },
    { label: "Today's visits", value: "—" },
  ];

  return (
    <AppShell user={user} active="/dashboard">
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 mb-3">
          Dashboard
        </p>
        <h1 className="text-3xl font-serif font-semibold text-stone-900 mb-1">
          Hey there 👋
        </h1>
        <p className="text-stone-500 mb-8">
          A quick look at the practice. Real numbers below — pulled live.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-xl bg-white border border-stone-200 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">
                {s.label}
              </p>
              <p className="text-3xl font-semibold text-stone-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              Get started
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              Build up your records — add patients, link cases, log visits.
            </p>
            <ul className="text-sm text-stone-700 space-y-2">
              <li>
                <a href="/patients/new" className="text-amber-700 hover:text-amber-800 font-medium">
                  ➜ Add your first patient
                </a>
              </li>
              <li>
                <a href="/lists" className="text-amber-700 hover:text-amber-800 font-medium">
                  ➜ Set up insurance carriers and attorneys
                </a>
              </li>
              <li>
                <span className="text-stone-400">
                  Schedule, billing, and CMS-1500 generation — coming soon.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              Recent activity
            </h2>
            <p className="text-sm text-stone-400">
              Nothing yet. Once you add patients and visits, recent updates
              will appear here.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
