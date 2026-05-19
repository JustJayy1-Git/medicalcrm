"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCase(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") redirect("/cases");

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  };
  const bool = (k: string) => formData.get(k) === "on";
  const intOrNull = (k: string) => {
    const v = str(k);
    if (v === null) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  const numOrNull = (k: string) => {
    const v = str(k);
    if (v === null) return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const arrAll = (k: string) =>
    formData
      .getAll(k)
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v !== "");
  const yesNo = (k: string) => {
    const v = str(k);
    return v === "yes" ? true : v === "no" ? false : null;
  };

  const payload = {
    case_type: str("case_type") ?? "mva",
    status: str("status") ?? "open",
    billing_method: str("billing_method") ?? "insurance",
    description: str("description"),

    // Personal
    assigned_provider_id: str("assigned_provider_id"),
    referring_provider_id: str("referring_provider_id"),
    supervising_provider_id: str("supervising_provider_id"),
    referral_source: str("referral_source"),
    facility_id: str("facility_id"),
    attorney_id: str("attorney_id"),
    lop_signed: bool("lop_signed"),
    lop_signed_date: str("lop_signed_date"),

    // Condition
    date_of_injury: str("date_of_injury"),
    initial_treatment_date: str("initial_treatment_date"),
    illness_date: str("illness_date"),
    same_or_similar_symptoms: bool("same_or_similar_symptoms"),
    similar_symptoms_date: str("similar_symptoms_date"),
    how_it_happened: str("how_it_happened"),
    fault: str("fault"),
    accident_state: str("accident_state"),
    accident_nature: str("accident_nature"),
    police_report_num: str("police_report_num"),
    fault_notes: str("fault_notes"),
    airbag_deployed: yesNo("airbag_deployed"),
    seatbelt_worn: yesNo("seatbelt_worn"),
    loss_consciousness: bool("loss_consciousness"),
    ambulance: bool("ambulance"),
    er_visit: bool("er_visit"),
    er_visit_facility: str("er_visit_facility"),
    er_visit_date: str("er_visit_date"),
    pain_locations: arrAll("pain_locations"),
    pain_level: intOrNull("pain_level"),
    pain_notes: str("pain_notes"),
    unable_to_work_from: str("unable_to_work_from"),
    unable_to_work_to: str("unable_to_work_to"),
    total_disability_from: str("total_disability_from"),
    total_disability_to: str("total_disability_to"),
    partial_disability_from: str("partial_disability_from"),
    partial_disability_to: str("partial_disability_to"),
    hospitalization_from: str("hospitalization_from"),
    hospitalization_to: str("hospitalization_to"),

    diagnosis_codes: arrAll("diagnosis_codes"),

    // Primary policy
    primary_carrier_id: str("primary_carrier_id"),
    primary_claim_number: str("primary_claim_number"),
    primary_policy_number: str("primary_policy_number"),
    primary_group_number: str("primary_group_number"),
    primary_group_name: str("primary_group_name"),
    primary_policy_start: str("primary_policy_start"),
    primary_policy_end: str("primary_policy_end"),
    primary_adjuster_name: str("primary_adjuster_name"),
    primary_adjuster_phone: str("primary_adjuster_phone"),
    primary_adjuster_email: str("primary_adjuster_email"),
    accept_assignment: bool("accept_assignment"),
    deductible_met: bool("deductible_met"),
    deductible_amount: numOrNull("deductible_amount"),
    copay_amount: numOrNull("copay_amount"),

    // Secondary policy
    secondary_carrier_id: str("secondary_carrier_id"),
    secondary_claim_number: str("secondary_claim_number"),
    secondary_policy_number: str("secondary_policy_number"),
    secondary_group_number: str("secondary_group_number"),
    secondary_group_name: str("secondary_group_name"),
    secondary_policy_start: str("secondary_policy_start"),
    secondary_policy_end: str("secondary_policy_end"),
    secondary_adjuster_name: str("secondary_adjuster_name"),
    secondary_adjuster_phone: str("secondary_adjuster_phone"),
    secondary_adjuster_email: str("secondary_adjuster_email"),

    // Authorization
    authorization_number: str("authorization_number"),
    authorized_visits: intOrNull("authorized_visits"),
    authorized_through: str("authorized_through"),
    last_visit_date: str("last_visit_date"),
    last_visit_number: intOrNull("last_visit_number"),
    date_of_first_visit: str("date_of_first_visit"),

    comments: str("comments"),
    notes: str("notes"),
  };

  const { error } = await supabase
    .from("cases")
    .update(payload)
    .eq("id", id);

  if (error) {
    redirect(`/cases/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/cases/${id}`);
  revalidatePath("/cases");
  redirect(`/cases/${id}`);
}
