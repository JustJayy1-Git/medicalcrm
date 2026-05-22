import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAttorneyLedger,
  type AttorneyCaseLedger,
} from "@/lib/attorney-ledger";

export async function fetchAttorneyCaseLedger(
  supabase: SupabaseClient,
  caseId: string,
): Promise<AttorneyCaseLedger | null> {
  const { data: c, error } = await supabase
    .from("cases")
    .select(
      `id, case_number, date_of_injury,
       patient:patients(first_name, last_name),
       attorney:attorneys(full_name, firm_name),
       carrier:insurance_carriers!cases_primary_carrier_id_fkey(id, name)`,
    )
    .eq("id", caseId)
    .maybeSingle();

  if (error || !c) return null;

  const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
  const attorney = Array.isArray(c.attorney) ? c.attorney[0] : c.attorney;
  const carrier = Array.isArray(c.carrier) ? c.carrier[0] : c.carrier;

  const { data: visits } = await supabase
    .from("visits")
    .select(
      `visit_date,
       charges(id, cpt_code, units, fee, paid, modifier, status)`,
    )
    .eq("case_id", caseId)
    .order("visit_date", { ascending: true });

  const patientName = patient
    ? `${patient.last_name}, ${patient.first_name}`
    : "Unknown patient";

  const attorneyName = attorney
    ? [attorney.full_name, attorney.firm_name].filter(Boolean).join(" · ")
    : null;

  const carrierName =
    carrier?.name ?? "Insurance / account (no carrier on file)";

  return buildAttorneyLedger({
    caseId: c.id,
    caseNumber: c.case_number,
    patientName,
    attorneyName,
    dateOfInjury: c.date_of_injury,
    carrierId: carrier?.id ?? null,
    carrierName,
    visits: visits ?? [],
  });
}

export async function fetchCaseLedgerOptions(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("cases")
    .select(
      `id, case_number, date_of_injury, status,
       patient:patients(last_name, first_name)`,
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((row) => {
    const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
    return {
      id: row.id,
      case_number: row.case_number,
      date_of_injury: row.date_of_injury,
      status: row.status,
      label: patient
        ? `${patient.last_name}, ${patient.first_name}${row.case_number ? ` · ${row.case_number}` : ""}`
        : row.case_number ?? row.id.slice(0, 8),
    };
  });
}
