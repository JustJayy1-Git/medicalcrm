import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
    <AppShell user={user} active="/patients">
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 mb-2">
              Patients
            </p>
            <h1 className="text-3xl font-serif font-semibold text-stone-900">
              All patients
            </h1>
          </div>
          <Link
            href="/patients/new"
            className="px-4 py-2 text-sm bg-gradient-to-b from-amber-400 to-amber-600 text-stone-900 font-semibold rounded-md hover:from-amber-300 hover:to-amber-500 shadow-sm transition-colors"
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
            className="w-full max-w-md px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
        </form>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Couldn&apos;t load patients: {error.message}
          </div>
        )}

        <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600 uppercase text-xs tracking-wider">
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
            <tbody className="divide-y divide-stone-200">
              {(patients ?? []).length === 0 && !error && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-stone-500">
                    No patients yet.{" "}
                    <Link
                      href="/patients/new"
                      className="text-amber-700 hover:text-amber-800 font-medium"
                    >
                      Add your first one
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {(patients ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-500 font-mono text-xs">
                    {p.chart_number ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/patients/${p.id}`}
                      className="text-stone-900 hover:text-amber-700 font-medium"
                    >
                      {p.last_name}, {p.first_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatDob(p.date_of_birth)}</td>
                  <td className="px-4 py-3 text-stone-600">{age(p.date_of_birth) ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-xs",
                        p.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200",
                      ].join(" ")}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/patients/${p.id}/edit`}
                      title="Edit patient"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
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
    </AppShell>
  );
}
