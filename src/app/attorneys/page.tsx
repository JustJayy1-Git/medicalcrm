import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ATTORNEY_LIST_SELECT } from "@/lib/attorney";

export const dynamic = "force-dynamic";

export default async function AttorneysPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
const params = await searchParams;
  const q = params.q?.trim();

  let query = supabase
    .from("attorneys")
    .select(ATTORNEY_LIST_SELECT)
    .order("attorney_name", { ascending: true });

  if (q) {
    query = query.or(
      `attorney_name.ilike.%${q}%,firm_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`,
    );
  }

  const { data: attorneys, error } = await query;
  const list = attorneys ?? [];

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-2">
              Attorneys
            </p>
            <h1 className="text-3xl font-serif font-semibold text-eggplant-900">
              Referral attorneys
            </h1>
            <p className="text-sm text-vice-muted mt-1 max-w-xl">
              Firms you work with on LOP cases. Pick from this list on a
              patient&apos;s case Attorney tab.
            </p>
          </div>
          <Link
            href="/attorneys/new"
            className="px-4 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm transition-colors"
          >
            + New attorney
          </Link>
        </div>

        <form className="mb-6" method="get">
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search attorney name, firm, phone, or email…"
            className="w-full max-w-md px-4 py-2 bg-white border border-vice-border rounded-lg text-sm text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-2 focus:ring-neon-mint/40 focus:border-neon-mint"
          />
        </form>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error.message}
          </div>
        )}

        <div className="rounded-xl border border-vice-border overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neon-mint-100 text-eggplant-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Attorney</th>
                <th className="text-left px-4 py-3 font-medium">Firm</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">City</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vice-border">
              {list.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-vice-muted">
                    {q ? (
                      "No attorneys match."
                    ) : (
                      <>
                        No attorneys yet.{" "}
                        <Link
                          href="/attorneys/new"
                          className="text-neon-pink hover:text-eggplant-800 font-medium"
                        >
                          Add your first one
                        </Link>
                        .
                      </>
                    )}
                  </td>
                </tr>
              )}
              {list.map((a) => (
                <tr key={a.id} className="hover:bg-vice-surface">
                  <td className="px-4 py-3">
                    <Link
                      href={`/attorneys/${a.id}`}
                      className="text-eggplant-900 hover:text-neon-pink font-medium"
                    >
                      {a.attorney_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-eggplant-700">{a.firm_name ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700">{a.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700">{a.email ?? "—"}</td>
                  <td className="px-4 py-3 text-eggplant-700">
                    {a.city ? `${a.city}, ${a.state ?? ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/attorneys/${a.id}`}
                      title="View / edit"
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
