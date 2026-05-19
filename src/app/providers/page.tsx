import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: providers, error } = await supabase
    .from("providers")
    .select("id, full_name, credentials, npi, phone, email, is_active")
    .order("full_name");

  return (
    <AppShell user={user} active="/providers">
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 mb-2">
              Providers
            </p>
            <h1 className="text-3xl font-serif font-semibold text-stone-900">
              Clinicians
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Doctors, PTs, and other rendering providers.
            </p>
          </div>
          <Link
            href="/providers/new"
            className="px-4 py-2 text-sm bg-gradient-to-b from-amber-400 to-amber-600 text-stone-900 font-semibold rounded-md hover:from-amber-300 hover:to-amber-500 shadow-sm transition-colors"
          >
            + New provider
          </Link>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error.message}
          </div>
        )}

        <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Credentials</th>
                <th className="text-left px-4 py-3 font-medium">NPI</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {(providers ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-stone-500">
                    No providers yet.{" "}
                    <Link
                      href="/providers/new"
                      className="text-amber-700 hover:text-amber-800 font-medium"
                    >
                      Add your first one
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {(providers ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-900 font-medium">{p.full_name}</td>
                  <td className="px-4 py-3 text-stone-600">{p.credentials ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600 font-mono text-xs">{p.npi ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-xs",
                        p.is_active
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-500 border border-stone-200",
                      ].join(" ")}
                    >
                      {p.is_active ? "active" : "inactive"}
                    </span>
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
