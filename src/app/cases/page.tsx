import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const supabase = await createClient();
const params = await searchParams;
  const q = params.q?.trim();
  const status = params.status?.trim();

  let query = supabase
    .from("cases")
    .select(
      `id, case_number, case_seq, case_letter, case_type, status,
       date_of_injury, billing_method, description,
       patient:patients(id, first_name, last_name, chart_number)`,
    )
    .order("case_seq", { ascending: false })
    .limit(300);

  if (status) query = query.eq("status", status);

  if (q) {
    query = query.or(
      `case_number.ilike.%${q}%,description.ilike.%${q}%`,
    );
  }

  const { data: cases, error } = await query;

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-2">
              Cases
            </p>
            <h1 className="text-3xl font-serif font-semibold text-eggplant-900">
              All cases
            </h1>
          </div>
        </div>

        <form className="mb-6 flex flex-wrap gap-3" method="get">
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search case # or name (e.g. MVA 03/15/2026, 247-A)…"
            className="flex-1 min-w-[280px] px-4 py-2 bg-white border border-vice-border rounded-lg text-sm text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-2 focus:ring-neon-mint/40 focus:border-neon-mint"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="px-4 py-2 bg-white border border-vice-border rounded-lg text-sm text-eggplant-900 focus:outline-none focus:ring-2 focus:ring-neon-mint/40"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="settled">Settled</option>
            <option value="closed">Closed</option>
            <option value="denied">Denied</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-eggplant-900 text-white rounded-md hover:bg-eggplant-900"
          >
            Filter
          </button>
        </form>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Couldn&apos;t load cases: {error.message}
          </div>
        )}

        <div className="rounded-xl border border-vice-border overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neon-mint-100 text-eggplant-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Case #</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Patient</th>
                <th className="text-left px-4 py-3 font-medium">DOA</th>
                <th className="text-left px-4 py-3 font-medium">Billing</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vice-border">
              {(cases ?? []).length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-vice-muted">
                    No cases yet.{" "}
                    <Link
                      href="/patients"
                      className="text-neon-pink hover:text-eggplant-800 font-medium"
                    >
                      Pick a patient and open one
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {(cases ?? []).map((c) => {
                const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
                return (
                  <tr key={c.id} className="hover:bg-vice-surface">
                    <td className="px-4 py-3">
                      <Link
                        href={`/cases/${c.id}`}
                        className="text-neon-pink hover:text-eggplant-800 font-mono text-xs font-medium"
                      >
                        {c.case_number ?? c.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-eggplant-900">
                      <Link
                        href={`/cases/${c.id}`}
                        className="hover:text-neon-pink"
                      >
                        {c.description ?? (
                          <span className="text-vice-muted italic">
                            (no name)
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-eggplant-800">
                      {patient ? (
                        <Link
                          href={`/patients/${patient.id}`}
                          className="hover:text-neon-pink"
                        >
                          {patient.last_name}, {patient.first_name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-eggplant-700">
                      {fmt(c.date_of_injury)}
                    </td>
                    <td className="px-4 py-3 text-eggplant-700 capitalize">
                      {c.billing_method}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "px-2 py-0.5 rounded-full text-xs border capitalize",
                          STATUS_PILL[c.status] ?? STATUS_PILL.closed,
                        ].join(" ")}
                      >
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/cases/${c.id}/edit`}
                        title="Edit case"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-vice-muted hover:text-neon-pink hover:bg-neon-mint-100 transition-colors"
                      >
                        ✏️
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
);
}
