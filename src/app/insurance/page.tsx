import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  auto: "Auto",
  health: "Health",
  workers_comp: "Workers' comp",
  other: "Other",
};

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const q = params.q?.trim();
  const type = params.type?.trim();

  let query = supabase
    .from("insurance_carriers")
    .select("id, name, carrier_type, payer_id, phone, city, state")
    .order("name");

  if (type) query = query.eq("carrier_type", type);
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,payer_id.ilike.%${q}%,phone.ilike.%${q}%`,
    );
  }

  const { data: carriers, error } = await query;

  return (
    <AppShell user={user} active="/insurance">
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 mb-2">
              Insurance
            </p>
            <h1 className="text-3xl font-serif font-semibold text-stone-900">
              Carriers
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              The insurance companies your patients are covered by.
            </p>
          </div>
          <Link
            href="/insurance/new"
            className="px-4 py-2 text-sm bg-gradient-to-b from-amber-400 to-amber-600 text-stone-900 font-semibold rounded-md hover:from-amber-300 hover:to-amber-500 shadow-sm transition-colors"
          >
            + New carrier
          </Link>
        </div>

        <form className="mb-6 flex flex-wrap gap-3" method="get">
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search carrier name, payer ID, or phone…"
            className="flex-1 min-w-[280px] px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
          <select
            name="type"
            defaultValue={type ?? ""}
            className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="">All types</option>
            <option value="auto">Auto</option>
            <option value="health">Health</option>
            <option value="workers_comp">Workers&apos; comp</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-800"
          >
            Filter
          </button>
        </form>

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
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Payer ID</th>
                <th className="text-left px-4 py-3 font-medium">Claims phone</th>
                <th className="text-left px-4 py-3 font-medium">City</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {(carriers ?? []).length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-500">
                    No carriers match.
                  </td>
                </tr>
              )}
              {(carriers ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/insurance/${c.id}`}
                      className="text-stone-900 hover:text-amber-700 font-medium"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {TYPE_LABEL[c.carrier_type ?? "other"] ?? c.carrier_type}
                  </td>
                  <td className="px-4 py-3 text-stone-600 font-mono text-xs">
                    {c.payer_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {c.city ? `${c.city}, ${c.state ?? ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/insurance/${c.id}`}
                      title="View / edit"
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
