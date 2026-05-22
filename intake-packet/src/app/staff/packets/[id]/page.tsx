import { getFormDefs } from "@/lib/forms-registry";
import { getPacketMeta } from "@/lib/form-persistence";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function PacketHubPage({ params }: Props) {
  const { id } = await params;
  const packetId = Number(id);
  if (!Number.isFinite(packetId)) notFound();

  const meta = await getPacketMeta(packetId);
  if (!meta) notFound();

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        Packet #{packetId}
        {meta.full_name ? ` — ${meta.full_name}` : ""}
      </h2>
      <p style={{ color: "var(--muted)" }}>
        Status: {meta.status}
        {meta.date_of_accident
          ? ` · Accident: ${new Date(meta.date_of_accident).toISOString().slice(0, 10)}`
          : ""}
      </p>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Forms (01–08)</h3>
        <ol className="form-list">
          {getFormDefs().map((f) => (
            <li key={f.slug}>
              <Link href={`/staff/packets/${packetId}/forms/${f.slug}`}>
                {String(f.page).padStart(2, "0")}. {f.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
