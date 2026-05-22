import { listPackets } from "@/lib/intake-packet/form-persistence";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IntakePacketsPage() {
  const supabase = await createClient();
  const packets = await listPackets(supabase);

  return (
    <div className="px-6 py-4 max-w-[1200px] mx-auto">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-neon-pink mb-0.5">
            Intake
          </p>
          <h1 className="text-xl font-serif font-semibold text-eggplant-900">Intake packets</h1>
        </div>
        <Link
          href="/portal"
          target="_blank"
          rel="noopener"
          className="text-sm text-neon-pink hover:underline"
        >
          Open kiosk portal ↗
        </Link>
      </div>

      <div className="rounded-lg border border-vice-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vice-surface/80 text-left text-vice-muted">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Accident</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {packets.map((p) => (
              <tr key={p.id} className="border-t border-vice-border">
                <td className="px-4 py-2">
                  <Link href={`/intake-packets/${p.id}`} className="text-neon-pink font-medium">
                    #{p.id}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.full_name || "—"}</td>
                <td className="px-4 py-2">{p.phone || "—"}</td>
                <td className="px-4 py-2">
                  {p.date_of_accident
                    ? new Date(p.date_of_accident).toISOString().slice(0, 10)
                    : "—"}
                </td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2">{new Date(p.updated_at).toLocaleString()}</td>
              </tr>
            ))}
            {packets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-vice-muted text-center">
                  No packets yet. Patients complete forms on the iPad portal.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
