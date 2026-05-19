"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ChargeInput = {
  line_number: number;
  cpt_code: string;
  units: number;
  fee_per_unit: number;
  modifier: string | null;
  icd_codes: string[];
};

export async function saveVisit(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  };
  const intOrNull = (k: string) => {
    const v = str(k);
    if (v === null) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };

  const caseId = str("case_id");
  const patientId = str("patient_id");
  const visitDate = str("visit_date");
  const visitType = str("visit_type") ?? "office";
  const providerId = str("provider_id");
  const pos = str("place_of_service") ?? "11";
  const visitNumber = intOrNull("visit_number");
  const notes = str("notes");

  if (!caseId || !patientId || !visitDate) {
    redirect(
      `/cases/${caseId ?? ""}/visits/new?error=${encodeURIComponent("Missing required fields")}`,
    );
  }

  let charges: ChargeInput[] = [];
  try {
    const raw = formData.get("charges_json");
    if (typeof raw === "string" && raw.length > 0) {
      charges = JSON.parse(raw) as ChargeInput[];
    }
  } catch {
    redirect(
      `/cases/${caseId}/visits/new?error=${encodeURIComponent("Invalid charge data")}`,
    );
  }

  if (charges.length === 0) {
    redirect(
      `/cases/${caseId}/visits/new?error=${encodeURIComponent("Add at least one charge line")}`,
    );
  }

  // 1. Insert the visit
  const { data: visit, error: visitErr } = await supabase
    .from("visits")
    .insert({
      case_id: caseId,
      patient_id: patientId,
      visit_date: visitDate,
      visit_type: visitType,
      provider_id: providerId,
      visit_number: visitNumber,
      notes,
      status: "completed",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (visitErr || !visit) {
    redirect(
      `/cases/${caseId}/visits/new?error=${encodeURIComponent(visitErr?.message ?? "Visit insert failed")}`,
    );
  }

  // 2. Insert charges in bulk
  const chargesRows = charges.map((c) => ({
    visit_id: visit.id,
    case_id: caseId,
    patient_id: patientId,
    line_number: c.line_number,
    cpt_code: c.cpt_code,
    units: c.units,
    fee: c.fee_per_unit,
    modifier: c.modifier,
    icd_codes: c.icd_codes,
    status: "unbilled" as const,
    notes: null,
    created_by: user.id,
  }));

  const { error: chargesErr } = await supabase.from("charges").insert(chargesRows);

  if (chargesErr) {
    // Best-effort rollback — delete the visit we just created
    await supabase.from("visits").delete().eq("id", visit.id);
    redirect(
      `/cases/${caseId}/visits/new?error=${encodeURIComponent(chargesErr.message)}`,
    );
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}/visits`);
  redirect(`/cases/${caseId}`);
}
