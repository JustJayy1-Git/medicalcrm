import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDob(dob: string | null) {
  if (!dob) return "—";
  return new Date(dob).toLocaleDateString("en-US");
}

function age(dob: string | null) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let a = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
  return a;
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
const params = await searchParams;
  const q = params.q?.trim();

  let query = supabase
    .from("patients")
    .select("id, first_name, last_name, date_of_birth, phone, email, status, chart_number, created_at")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(200);

  if (q) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,chart_number.ilike.%${q}%`,
    );
  }

  const { data: patients, error } = await query;

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-2">
              Patients
            </p>
            <h1 className="text-3xl font-serif font-semibold text-eggplant-900">
              All patients
            </h1>
          </div>
          <Link
            href="/patients/new"
            className="px-4 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm transition-colors"
          >
            + New patient
          </Link>
        </div>

        <form className="mb-6" method="get">
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search by name, chart #, phone, or email…"
            className="w-full max-w-md px-4 py-2 bg-white border border-vice-border rounded-lg text-sm text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-2 focus:ring-neon-mint/40 focus:border-neon-mint"
          />
        </form>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Couldn&apos;t load patients: {error.message}
          </div>
        )}

        <div className="rounded-xl border border-vice-border overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neon-mint-100 text-eggplant-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Chart #</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">DOB</th>
                <th className="text-left px-4 py-3 font-medium">Age</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vice-border">
              {(patients ?? []).length === 0 && !error && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-vice-muted">
                    No patients yet.{" "}
                    <Link
                      href="/patients/new"
                      className="text-neon-pink hover:text-eggplant-800 font-medium"
                    >
                      Add your first one
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {(patients ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-vice-surface">
                  <td className="px-4 py-3 text-vice-muted font-mono text-xs">
                    {p.chart_number ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/patients/${p.id}`}
                      className="text-eggplant-900 hover:text-neon-pink font-medium"
                    >
                      {p.last_name}, {p.first_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-eggplant-700">{formatDob(p.date_of_birth)}</td>
                  <td className="px-4 py-3 text-eggplant-700">{age(p.date_of_birth) ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-xs",
                        p.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-neon-mint-100 text-eggplant-700 border border-vice-border",
                      ].join(" ")}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/patients/${p.id}/edit`}
                      title="Edit patient"
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
      </div>
);
}
