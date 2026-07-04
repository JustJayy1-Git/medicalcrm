import { getFormDefs } from "@/lib/intake-packet/forms-registry.server";
import { getPacketMeta } from "@/lib/intake-packet/form-persistence";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function IntakePacketDetailPage({ params }: Props) {
  const { id } = await params;
  const packetId = Number(id);
  if (!Number.isFinite(packetId)) notFound();

  const supabase = await createClient();
  const meta = await getPacketMeta(supabase, packetId);
  if (!meta) notFound();

  return (
    <div className="px-6 py-4 max-w-[900px] mx-auto">
      <Link href="/intake-packets" className="text-sm text-vice-muted hover:text-neon-pink">
        ← All packets
      </Link>
      <div className="flex items-center justify-between gap-4 mt-2 mb-1">
        <h1 className="text-xl font-serif font-semibold text-eggplant-900">
          Packet #{packetId}
          {meta.full_name ? ` — ${meta.full_name}` : ""}
        </h1>
        <Link
          href={`/intake-packets/${packetId}/print`}
          className="shrink-0 px-3 py-1.5 text-xs border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100 font-medium"
        >
          🖨 Print packet
        </Link>
      </div>
      <p className="text-sm text-vice-muted mb-6">
        Status: {meta.status}
        {meta.patient_id ? (
          <>
            {" · "}
            <Link href={`/patients/${meta.patient_id}`} className="text-neon-pink hover:underline">
              Open patient chart
            </Link>
          </>
        ) : null}
        {meta.case_id ? (
          <>
            {" · "}
            <Link href={`/cases/${meta.case_id}`} className="text-neon-pink hover:underline">
              Open case
            </Link>
          </>
        ) : null}
      </p>

      <ol className="space-y-2">
        {getFormDefs().map((f) => (
          <li key={f.slug}>
            <Link
              href={`/intake-packets/${packetId}/forms/${f.slug}`}
              className="block px-4 py-3 rounded-lg border border-vice-border bg-white hover:border-neon-mint/50"
            >
              <span className="text-vice-muted text-xs mr-2">
                {String(f.page).padStart(2, "0")}
              </span>
              {f.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
