import { getFormBySlug, FORM_ORDER, isFormSlug } from "@/lib/forms-registry";
import { getPacketMeta } from "@/lib/form-persistence";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string; slug: string }> };

export default async function FormViewerPage({ params }: Props) {
  const { id, slug } = await params;
  if (!isFormSlug(slug)) notFound();

  const packetId = Number(id);
  if (!Number.isFinite(packetId)) notFound();

  const meta = await getPacketMeta(packetId);
  if (!meta) notFound();

  const def = getFormBySlug(slug);
  const idx = FORM_ORDER.indexOf(slug);
  const prev = idx > 0 ? FORM_ORDER[idx - 1] : null;
  const next = idx < FORM_ORDER.length - 1 ? FORM_ORDER[idx + 1] : null;
  const src = `/serve/forms/${slug}?packetId=${packetId}`;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
        <Link href={`/staff/packets/${packetId}`} className="btn btn-secondary">
          ← Packet
        </Link>
        {prev ? (
          <Link href={`/staff/packets/${packetId}/forms/${prev}`} className="btn btn-secondary">
            Previous
          </Link>
        ) : null}
        {next ? (
          <Link href={`/staff/packets/${packetId}/forms/${next}`} className="btn">
            Next form →
          </Link>
        ) : null}
      </div>
      <h2 style={{ margin: "0 0 0.5rem" }}>
        {String(def.page).padStart(2, "0")}. {def.title}
      </h2>
      <iframe title={def.title} className="form-frame" src={src} />
    </div>
  );
}
