import { TherapyPrint } from "@/components/therapy/therapy-print";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TherapyRecordPrintPage({
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
      backHref={`/therapy/cases/${caseId}`}
      backLabel="Back to patient"
    />
  );
}
