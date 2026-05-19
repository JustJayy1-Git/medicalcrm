"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPatient(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  const payload = {
    // Identity / chart
    chart_number: str("chart_number"),
    ar_status: str("ar_status"),
    is_inactive: bool("is_inactive"),

    // Name
    last_name: str("last_name")!,
    suffix: str("suffix"),
    first_name: str("first_name")!,
    middle_name: str("middle_name"),
    preferred_name: str("preferred_name"),

    // Address
    address_line1: str("address_line1"),
    address_line2: str("address_line2"),
    city: str("city"),
    state: str("state"),
    zip: str("zip"),
    country: str("country") ?? "USA",
    email: str("email"),

    // Phones
    phone_home: str("phone_home"),
    phone_work: str("phone_work"),
    phone_cell: str("phone_cell"),
    phone_fax: str("phone_fax"),
    phone_other: str("phone_other"),
    phone: str("phone_cell") ?? str("phone_home"), // best contact fallback

    // Previous
    prev_last_name: str("prev_last_name"),
    prev_first_name: str("prev_first_name"),
    prev_middle_name: str("prev_middle_name"),
    prev_suffix: str("prev_suffix"),
    prev_address_line1: str("prev_address_line1"),
    prev_address_line2: str("prev_address_line2"),
    prev_city: str("prev_city"),
    prev_state: str("prev_state"),
    prev_zip: str("prev_zip"),
    prev_country: str("prev_country"),

    // Demographics
    date_of_birth: str("date_of_birth"),
    birth_weight: str("birth_weight"),
    ssn_full: str("ssn_full"),
    ssn_last4:
      (str("ssn_full") ?? "").replace(/\D/g, "").slice(-4) || null,
    ethnicity: str("ethnicity"),
    sex: str("sex") as "M" | "F" | "X" | null,
    units: str("units"),
    entity_type: str("entity_type"),
    language: str("language") ?? "en",
    death_date: str("death_date"),
    birth_sex: str("birth_sex"),
    sexual_orientation: str("sexual_orientation"),
    gender_identity: str("gender_identity"),

    // Race
    race_native_american: bool("race_native_american"),
    race_asian: bool("race_asian"),
    race_black: bool("race_black"),
    race_pacific_islander: bool("race_pacific_islander"),
    race_white: bool("race_white"),
    race_other: bool("race_other"),
    race_declined: bool("race_declined"),

    // Other Information tab
    patient_type: str("patient_type") ?? "patient",
    assigned_provider_id: str("assigned_provider_id"),
    patient_id_2: str("patient_id_2"),
    patient_billing_code: str("patient_billing_code"),
    patient_indicator: str("patient_indicator"),
    healthcare_id: str("healthcare_id"),
    medical_record_number: str("medical_record_number"),
    signature_on_file: bool("signature_on_file"),
    signature_date: str("signature_date"),

    // Emergency contact
    emergency_name: str("emergency_name"),
    emergency_phone: str("emergency_phone"),
    emergency_relation: str("emergency_relation"),

    // Employer
    employer_name: str("employer_name"),
    employment_status: str("employment_status"),
    employer_phone: str("employer_phone"),
    employer_phone_ext: str("employer_phone_ext"),
    employer_location: str("employer_location"),
    retirement_date: str("retirement_date"),

    // Portal
    web_enabled: bool("web_enabled"),
    appointments_allowed: intOrNull("appointments_allowed"),

    notes: str("notes"),

    created_by: user.id,
  };

  if (!payload.first_name || !payload.last_name) {
    redirect("/patients/new?error=missing_name");
  }

  const { data, error } = await supabase
    .from("patients")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/patients/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/patients");
  redirect(`/patients/${data.id}`);
}
