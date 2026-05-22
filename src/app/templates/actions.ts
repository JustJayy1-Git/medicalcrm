"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_CATEGORIES = new Set([
  "patient_file",
  "letters",
  "billing",
  "legal",
  "admin",
  "other",
]);

type UploadInput = {
  name: string;
  description?: string | null;
  category: string;
  fileName: string;
  mimeType: string;
  base64: string;
};

export async function uploadTemplate(
  input: UploadInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Template name is required." };
  if (!ALLOWED_CATEGORIES.has(input.category)) {
    return { ok: false, error: "Invalid category." };
  }

  const mime = input.mimeType || "application/pdf";
  if (mime !== "application/pdf") {
    return { ok: false, error: "Only PDF files are allowed for templates." };
  }

  const cleaned = input.base64.replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(cleaned, "base64");
  if (bytes.byteLength > MAX_BYTES) {
    return { ok: false, error: "File is too large (max 25 MB)." };
  }

  const ext = (input.fileName.split(".").pop() ?? "pdf").toLowerCase();
  const path = `${input.category}/${randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("office-templates")
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  const { data, error } = await supabase
    .from("document_templates")
    .insert({
      name,
      description: input.description?.trim() || null,
      category: input.category,
      file_name: input.fileName,
      storage_path: path,
      mime_type: mime,
      size_bytes: bytes.byteLength,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from("office-templates").remove([path]);
    return { ok: false, error: error.message };
  }

  revalidatePath("/templates");
  return { ok: true, id: data.id };
}

export async function deleteTemplate(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: row, error: getErr } = await supabase
    .from("document_templates")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (getErr) return { ok: false, error: getErr.message };
  if (!row) return { ok: false, error: "Template not found." };

  await supabase.storage.from("office-templates").remove([row.storage_path]);
  const { error: delErr } = await supabase
    .from("document_templates")
    .delete()
    .eq("id", id);
  if (delErr) return { ok: false, error: delErr.message };

  revalidatePath("/templates");
  return { ok: true };
}

export async function getTemplateUrl(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("document_templates")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!row) return null;

  const { data } = await supabase.storage
    .from("office-templates")
    .createSignedUrl(row.storage_path, 60 * 10);
  return data?.signedUrl ?? null;
}
