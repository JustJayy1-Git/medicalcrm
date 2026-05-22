import { PortalFormFrame } from "@/components/portal/portal-form-frame";
import { isFormSlug } from "@/lib/intake-packet/form-slugs";
import { getFormBySlug } from "@/lib/intake-packet/forms-registry.server";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string; slug: string }> };

export default async function StaffIntakeFormPage({ params }: Props) {
  const { id, slug } = await params;
  if (!isFormSlug(slug)) notFound();

  const packetId = Number(id);
  if (!Number.isFinite(packetId)) notFound();

  const def = getFormBySlug(slug);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1d24]">
      <div className="px-4 py-2 bg-eggplant-900 flex items-center gap-3 shrink-0">
        <Link href={`/intake-packets/${packetId}`} className="text-sm text-white/70 hover:text-white">
          ← Back to packet
        </Link>
      </div>
      <PortalFormFrame
        packetId={packetId}
        slug={slug}
        title={def.title}
        page={def.page}
        mode="staff"
      />
    </div>
  );
}
