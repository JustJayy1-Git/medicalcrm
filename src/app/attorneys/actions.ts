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
    attorney_name: str("attorney_name"),
    firm_name: str("firm_name"),
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

export async function createAttorney(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = readForm(formData);
  if (!payload.attorney_name) redirect("/attorneys/new?error=missing_name");

  const { data, error } = await supabase
    .from("attorneys")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/attorneys/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/attorneys");
  redirect(`/attorneys/${data.id}`);
}

export async function updateAttorney(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") redirect("/attorneys");

  const payload = readForm(formData);
  if (!payload.attorney_name) redirect(`/attorneys/${id}?error=missing_name`);

  const { error } = await supabase
    .from("attorneys")
    .update(payload)
    .eq("id", id);

  if (error) {
    redirect(`/attorneys/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/attorneys");
  revalidatePath(`/attorneys/${id}`);
  redirect(`/attorneys/${id}`);
}
