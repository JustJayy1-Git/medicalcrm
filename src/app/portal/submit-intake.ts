"use server";

import {
  createPortalPacket,
  saveForm,
  type FormPayload,
} from "@/lib/intake-packet/form-persistence";
import { PORTAL_FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return value == null ? "" : String(value);
}

function checked(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

export async function submitPortalIntake(formData: FormData): Promise<void> {
  const firstName = field(formData, "first_name").trim();
  const lastName = field(formData, "last_name").trim();

  if (!firstName || !lastName) {
    redirect("/portal/intake?error=missing_name");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/intake");

  const { packetId } = await createPortalPacket(supabase, user.id);

  const middleName = field(formData, "middle_name").trim();
  const payload: FormPayload = {
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName,
    suffix: field(formData, "suffix"),
    preferred_name: field(formData, "preferred_name"),
    patient_name: [firstName, middleName, lastName].filter(Boolean).join(" "),
    dob: field(formData, "date_of_birth"),
    ssn_full: field(formData, "ssn_full"),
    address_line1: field(formData, "address_line1"),
    address_line2: field(formData, "address_line2"),
    city: field(formData, "city"),
    state: field(formData, "state"),
    zip: field(formData, "zip"),
    email: field(formData, "email"),
    phone_cell: field(formData, "phone_cell"),
    phone_home: field(formData, "phone_home"),
    phone_work: field(formData, "phone_work"),
    language: field(formData, "language"),
    sex: field(formData, "sex"),
    ethnicity: field(formData, "ethnicity"),
    race_native_american: checked(formData, "race_native_american"),
    race_asian: checked(formData, "race_asian"),
    race_black: checked(formData, "race_black"),
    race_pacific_islander: checked(formData, "race_pacific_islander"),
    race_white: checked(formData, "race_white"),
    race_declined: checked(formData, "race_declined"),
    emergency_name: field(formData, "emergency_name"),
    emergency_phone: field(formData, "emergency_phone"),
    emergency_relation: field(formData, "emergency_relation"),
    employer_name: field(formData, "employer_name"),
    employment_status: field(formData, "employment_status"),
    employer_phone: field(formData, "employer_phone"),
  };

  await saveForm(supabase, packetId, "intake", payload);

  const first = PORTAL_FORM_ORDER[0];
  redirect(`/portal/packet/${packetId}/forms/${first}`);
}
