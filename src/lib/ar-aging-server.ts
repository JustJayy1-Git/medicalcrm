import type { SupabaseClient } from "@supabase/supabase-js";
import { buildArAgingReport, type ArAgingReport } from "@/lib/ar-aging";

export async function fetchArAgingReport(
  supabase: SupabaseClient,
): Promise<ArAgingReport> {
  const { data, error } = await supabase
    .from("charges")
    .select(
      `id, balance, billed_date, cpt_code, case_id,
       visit:visits(visit_date),
       case:cases(
         id, case_number,
         patient:patients(last_name, first_name),
         carrier:insurance_carriers!cases_primary_carrier_id_fkey(id, name)
       )`,
    )
    .gt("balance", 0)
    .order("billed_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("fetchArAgingReport:", error.message);
    return buildArAgingReport([]);
  }

  const flat = (data ?? []).map((row) => {
    const visit = Array.isArray(row.visit) ? row.visit[0] : row.visit;
    const c = Array.isArray(row.case) ? row.case[0] : row.case;
    const patient = c?.patient
      ? Array.isArray(c.patient)
        ? c.patient[0]
        : c.patient
      : null;
    const carrier = c?.carrier
      ? Array.isArray(c.carrier)
        ? c.carrier[0]
        : c.carrier
      : null;

    return {
      id: row.id,
      balance: Number(row.balance),
      billed_date: row.billed_date,
      cpt_code: row.cpt_code,
      visit_date: visit?.visit_date ?? null,
      case_id: c?.id ?? row.case_id,
      case_number: c?.case_number ?? null,
      patient_last: patient?.last_name ?? null,
      patient_first: patient?.first_name ?? null,
      carrier_id: carrier?.id ?? null,
      carrier_name: carrier?.name ?? null,
    };
  });

  return buildArAgingReport(flat);
}
