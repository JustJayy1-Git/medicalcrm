import { notFound } from "next/navigation";
import { IntakePrintFrames } from "@/components/intake/intake-print-frames";
import { PrintToolbar } from "@/components/print/print-toolbar";
import { getPacketMeta } from "@/lib/intake-packet/form-persistence";
import { getFormDefs } from "@/lib/intake-packet/forms-registry.server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PRINT_CSS = `
  @media print {
    .no-print { display: none !important; }
    body { background: #fff !important; }
    .intake-print-page { page-break-after: always; }
    .intake-print-page iframe { width: 816px !important; }
  }
`;

export default async function IntakePacketPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const packetId = Number(id);
  if (!Number.isFinite(packetId)) notFound();

  const supabase = await createClient();
  const meta = await getPacketMeta(supabase, packetId);
  if (!meta) notFound();

  const slugs = getFormDefs().map((f) => ({ slug: f.slug, title: f.title }));

  return (
    <div className="min-h-screen bg-[#1a1d24]">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <PrintToolbar
        backHref={`/intake-packets/${packetId}`}
        backLabel="Back to packet"
        title={`Intake packet #${packetId} · ${slugs.length} forms`}
      />
      <div className="px-3 py-4">
        <IntakePrintFrames packetId={packetId} slugs={slugs} />
      </div>
    </div>
  );
}
