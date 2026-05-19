"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function readForm(formData: FormData) {
  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  };
  return {
    name: str("name"),
    carrier_type: str("carrier_type") ?? "auto",
    payer_id: str("payer_id"),
    phone: str("phone"),
    fax: str("fax"),
    email: str("email"),
    address_line1: str("address_line1"),
    address_line2: str("address_line2"),
    city: str("city"),
    state: str("state"),
    zip: str("zip"),
    notes: str("notes"),
  };
}

export async function createCarrier(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = readForm(formData);
  if (!payload.name) redirect("/insurance/new?error=missing_name");

  const { data, error } = await supabase
    .from("insurance_carriers")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/insurance/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/insurance");
  redirect(`/insurance/${data.id}`);
}

export async function updateCarrier(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") redirect("/insurance");

  const payload = readForm(formData);
  if (!payload.name) redirect(`/insurance/${id}?error=missing_name`);

  const { error } = await supabase
    .from("insurance_carriers")
    .update(payload)
    .eq("id", id);

  if (error) {
    redirect(`/insurance/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/insurance");
  revalidatePath(`/insurance/${id}`);
  redirect(`/insurance/${id}`);
}
