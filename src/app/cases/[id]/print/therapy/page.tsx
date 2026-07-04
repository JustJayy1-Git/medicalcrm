import { TherapyPrint } from "@/components/therapy/therapy-print";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CaseTherapyPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;
  const supabase = await createClient();

  return (
    <TherapyPrint
      supabase={supabase}
      caseId={caseId}
      backHref={`/cases/${caseId}`}
      backLabel="Back to case"
    />
  );
}
