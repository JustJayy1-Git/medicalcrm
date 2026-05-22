import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const supabase = await createClient();
const { data: providers, error } = await supabase
    .from("providers")
    .select("id, full_name, credentials, npi, phone, email, is_active")
    .order("full_name");

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-2">
              Providers
            </p>
            <h1 className="text-3xl font-serif font-semibold text-eggplant-900">
              Clinicians
            </h1>
            <p className="text-sm text-vice-muted mt-1">
              Doctors, PTs, and other rendering providers.
            </p>
          </div>
          <Link
            href="/providers/new"
            className="px-4 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm transition-colors"
          >
            + New provider
          </Link>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error.message}
          </div>
        )}

        <div className="rounded-xl border border-vice-border overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neon-mint-100 text-eggplant-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Credentials</th>
                <th className="text-left px-4 py-3 font-medium">NPI</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-vice-border">
              {(providers ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-vice-muted">
                    No providers yet.{" "}
                    <Link
                      href="/providers/new"
                      className="text-neon-pink hover:text-eggplant-800 font-medium"
                    >
                      Add your first one
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {(providers ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-vice-surface">
                  <td className="px-4 py-3">
                    <Link
                      href={`/providers/${p.id}`}
                      className="text-eggplant-900 hover:text-neon-pink font-medium"
                    >
                      {p.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-eggplant-700">{p.credentials ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700 font-mono text-xs">{p.npi ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700 text-xs">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "px-2 py-0.5 rounded-full text-xs",
                        p.is_active
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-neon-mint-100 text-vice-muted border border-vice-border",
                      ].join(" ")}
                    >
                      {p.is_active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/providers/${p.id}`}
                      title="Edit provider"
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
