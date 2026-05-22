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
    full_name: str("full_name"),
    credentials: str("credentials"),
    npi: str("npi"),
    tax_id: str("tax_id"),
    taxonomy_code: str("taxonomy_code"),
    phone: str("phone"),
    email: str("email"),
    is_active: active === "on" || active === "true",
  };
}

export async function createProvider(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = readForm(formData);
  if (!payload.full_name) redirect("/providers/new?error=missing_name");

  const { data, error } = await supabase
    .from("providers")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/providers/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/providers");
  redirect(`/providers/${data.id}`);
}

export async function updateProvider(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") redirect("/providers");

  const payload = readForm(formData);
  if (!payload.full_name) redirect(`/providers/${id}?error=missing_name`);

  const { error } = await supabase
    .from("providers")
    .update(payload)
    .eq("id", id);

  if (error) {
    redirect(`/providers/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/providers");
  revalidatePath(`/providers/${id}`);
  redirect(`/providers/${id}`);
}
