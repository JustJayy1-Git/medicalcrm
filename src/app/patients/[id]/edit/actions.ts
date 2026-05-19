"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePatient(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") redirect("/patients");

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  };
  const bool = (k: string) => formData.get(k) === "on";

  const payload = {
    chart_number: str("chart_number"),
    ar_status: str("ar_status"),
    is_inactive: bool("is_inactive"),

    last_name: str("last_name")!,
    suffix: str("suffix"),
    first_name: str("first_name")!,
    middle_name: str("middle_name"),
    preferred_name: str("preferred_name"),

    address_line1: str("address_line1"),
    address_line2: str("address_line2"),
    city: str("city"),
    state: str("state"),
    zip: str("zip"),
    country: str("country") ?? "USA",
    email: str("email"),

    phone_home: str("phone_home"),
    phone_work: str("phone_work"),
    phone_cell: str("phone_cell"),
    phone_fax: str("phone_fax"),
    phone_other: str("phone_other"),
    phone: str("phone_cell") ?? str("phone_home"),

    date_of_birth: str("date_of_birth"),
    ssn_full: str("ssn_full"),
    ssn_last4:
      (str("ssn_full") ?? "").replace(/\D/g, "").slice(-4) || null,
    sex: str("sex") as "M" | "F" | "X" | null,
    language: str("language") ?? "en",

    assigned_provider_id: str("assigned_provider_id"),
    signature_on_file: bool("signature_on_file"),
    signature_date: str("signature_date"),
  };

  if (!payload.first_name || !payload.last_name) {
    redirect(`/patients/${id}/edit?error=missing_name`);
  }

  const { error } = await supabase
    .from("patients")
    .update(payload)
    .eq("id", id);

  if (error) {
    redirect(
      `/patients/${id}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  redirect(`/patients/${id}`);
}
