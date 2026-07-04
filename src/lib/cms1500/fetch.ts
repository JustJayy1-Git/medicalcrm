import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCms1500Pages } from "./build";
import type { Cms1500Claim } from "./types";

export type CaseClaimOption = {
  id: string;
  label: string;
  patientChart: string | null;
  serviceDates: string[];
};

export async function fetchCaseClaimOptions(
  supabase: SupabaseClient,
): Promise<CaseClaimOption[]> {
  const { data: cases, error } = await supabase
    .from("cases")
    .select(
      `id, description, case_number, case_type,
       patient:patients(first_name, last_name, chart_number),
       visits(id, visit_date, charges(id))`,
    )
    .in("status", ["open", "active", "on_hold", "settled"])
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("fetchCaseClaimOptions:", error.message);
    return [];
  }

  return (cases ?? []).map((c) => {
    const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
    const visits = (c.visits ?? []) as {
      visit_date: string;
      charges?: { id: string }[] | null;
    }[];
    const dates = [
      ...new Set(
        visits
          .filter((v) => (v.charges?.length ?? 0) > 0)
          .map((v) => v.visit_date),
      ),
    ].sort();
    const name = patient
      ? `${patient.last_name}, ${patient.first_name}`
      : "Unknown";
    const label = `${c.case_number ?? c.id.slice(0, 8)} · ${name}`;
    return {
      id: c.id,
      label,
      patientChart: patient?.chart_number ?? null,
      serviceDates: dates,
    };
  });
}

export async function fetchClaimsForCaseDos(
  supabase: SupabaseClient,
  caseId: string,
  dateOfService: string,
): Promise<Cms1500Claim[]> {
  const { data: c, error: caseErr } = await supabase
    .from("cases")
    .select(
      `*,
       patient:patients(*),
       carrier:insurance_carriers!cases_primary_carrier_id_fkey(*),
       facility:facilities!cases_facility_id_fkey(*)`,
    )
    .eq("id", caseId)
    .maybeSingle();

  if (caseErr || !c) {
    console.error("fetchClaimsForCaseDos case:", caseErr?.message);
    return [];
  }

  const patient = Array.isArray(c.patient) ? c.patient[0] : c.patient;
  if (!patient) return [];

  const carrier = Array.isArray(c.carrier) ? c.carrier[0] : c.carrier;
  const facility = Array.isArray(c.facility) ? c.facility[0] : c.facility;

  const { data: visit, error: visitErr } = await supabase
    .from("visits")
    .select(
      `id, visit_date, provider:providers(full_name, credentials, npi),
       charges(id, cpt_code, modifier, units, fee, icd_codes)`,
    )
    .eq("case_id", caseId)
    .eq("visit_date", dateOfService)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (visitErr) {
    console.error("fetchClaimsForCaseDos visit:", visitErr.message);
    return [];
  }

  if (!visit) return [];

  const provider = Array.isArray(visit.provider)
    ? visit.provider[0]
    : visit.provider;
  // No slicing here — buildCms1500Pages splits consults onto their own
  // forms and chunks therapy lines six per form.
  const charges = (visit.charges ?? []) as {
    cpt_code: string | null;
    modifier?: string | null;
    units?: number | null;
    fee?: number | string | null;
    icd_codes?: string[] | null;
  }[];

  return buildCms1500Pages({
    caseId,
    visitId: visit.id,
    dateOfService,
    patient,
    caseRow: c,
    carrier,
    facility,
    renderingProvider: provider,
    charges,
  });
}

export async function fetchAllClaimsForCase(
  supabase: SupabaseClient,
  caseId: string,
): Promise<{ dos: string; claims: Cms1500Claim[] }[]> {
  const { data: visits } = await supabase
    .from("visits")
    .select("visit_date, charges(id)")
    .eq("case_id", caseId)
    .order("visit_date", { ascending: true });

  const dates = [
    ...new Set(
      (visits ?? [])
        .filter((v) => (v.charges as { id: string }[] | null)?.length)
        .map((v) => v.visit_date as string),
    ),
  ];

  const out: { dos: string; claims: Cms1500Claim[] }[] = [];
  for (const dos of dates) {
    const claims = await fetchClaimsForCaseDos(supabase, caseId, dos);
    if (claims.length) out.push({ dos, claims });
  }
  return out;
}
