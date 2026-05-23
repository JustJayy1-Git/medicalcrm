import { PortalFormFrame } from "@/components/portal/portal-form-frame";
import { isFormSlug, isPortalFormSlug } from "@/lib/intake-packet/form-slugs";
import { getFormBySlug } from "@/lib/intake-packet/forms-registry.server";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string; slug: string }> };

export default async function PortalFormPage({ params }: Props) {
  const { id, slug } = await params;
  if (!isFormSlug(slug)) notFound();

  if (!isPortalFormSlug(slug)) {
    redirect(`/portal/packet/${id}/forms/aob`);
  }

  const packetId = Number(id);
  if (!Number.isFinite(packetId)) notFound();

  const def = getFormBySlug(slug);

  return (
    <PortalFormFrame packetId={packetId} slug={slug} title={def.title} page={def.page} />
  );
}
