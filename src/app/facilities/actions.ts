"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function readForm(formData: FormData) {
  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  };
  const active = formData.get("is_active");
  return {
    name: str("name"),
    address_line1: str("address_line1"),
    address_line2: str("address_line2"),
    city: str("city"),
    state: str("state"),
    zip: str("zip"),
    phone: str("phone"),
    fax: str("fax"),
    npi: str("npi"),
    tax_id: str("tax_id"),
    is_active: active === "on" || active === "true",
  };
}

export async function createFacility(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = readForm(formData);
  if (!payload.name) redirect("/facilities/new?error=missing_name");

  const { data, error } = await supabase
    .from("facilities")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/facilities/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/facilities");
  redirect(`/facilities/${data.id}`);
}

export async function updateFacility(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") redirect("/facilities");

  const payload = readForm(formData);
  if (!payload.name) redirect(`/facilities/${id}?error=missing_name`);

  const { error } = await supabase
    .from("facilities")
    .update(payload)
    .eq("id", id);

  if (error) {
    redirect(`/facilities/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/facilities");
  revalidatePath(`/facilities/${id}`);
  redirect(`/facilities/${id}`);
}
