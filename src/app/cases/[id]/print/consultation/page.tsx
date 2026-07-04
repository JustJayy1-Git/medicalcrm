import { ConsultationPrint } from "@/components/clinical/consultation-print";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CaseConsultationPrintPage({
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
      backHref={`/cases/${caseId}`}
      backLabel="Back to case"
    />
  );
}
