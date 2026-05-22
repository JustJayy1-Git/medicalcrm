import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCaseLedger, type CaseLedger } from "@/lib/charge-ledger";

export async function fetchCaseLedger(
  supabase: SupabaseClient,
  caseId: string,
): Promise<CaseLedger> {
  const { data: visits, error } = await supabase
    .from("visits")
    .select(
      `id, visit_date, visit_type, notes,
       charges(id, cpt_code, units, fee, paid, modifier, icd_codes, status)`,
    )
    .eq("case_id", caseId)
    .order("visit_date", { ascending: true });

  if (error) {
    console.error("fetchCaseLedger:", error.message);
    return buildCaseLedger([]);
  }

  return buildCaseLedger(visits ?? []);
}
