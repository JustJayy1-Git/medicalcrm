import { ConsultationPrint } from "@/components/clinical/consultation-print";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClinicalConsultationPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;
  const supabase = await createClient();

  return (
    <ConsultationPrint
      supabase={supabase}
      caseId={caseId}
      backHref={`/clinical/cases/${caseId}`}
      backLabel="Back to packet"
    />
  );
}
