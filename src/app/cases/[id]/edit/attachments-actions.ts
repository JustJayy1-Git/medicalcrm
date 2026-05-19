"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";

type UploadInput = {
  caseId: string;
  patientId: string;
  kind: string;
  fileName: string;
  mimeType: string;
  base64: string;
};

/**
 * Upload a file (base64 from the browser) to Supabase Storage
 * and record an attachment row. Returns the new id on success.
 */
export async function uploadAttachment(input: UploadInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const allowedKinds = new Set([
    "insurance_card_front",
    "insurance_card_back",
    "id_card",
    "lop_letter",
    "police_report",
    "medical_record",
    "other",
  ]);
  if (!allowedKinds.has(input.kind)) {
    return { ok: false, error: "Invalid attachment kind." };
  }

  const ext = (input.fileName.split(".").pop() ?? "bin").toLowerCase();
  const path = `${input.caseId}/${input.kind}/${randomUUID()}.${ext}`;

  // Decode base64 → bytes
  const cleaned = input.base64.replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(cleaned, "base64");

  const { error: upErr } = await supabase.storage
    .from("case-files")
    .upload(path, bytes, {
      contentType: input.mimeType || "application/octet-stream",
      upsert: false,
    });
  if (upErr) return { ok: false, error: upErr.message };

  const { data, error } = await supabase
    .from("case_attachments")
    .insert({
      case_id: input.caseId,
      patient_id: input.patientId,
      kind: input.kind,
      label: input.fileName,
      storage_path: path,
      mime_type: input.mimeType,
      size_bytes: bytes.byteLength,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    // Best-effort cleanup of the storage object
    await supabase.storage.from("case-files").remove([path]);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/cases/${input.caseId}`);
  revalidatePath(`/cases/${input.caseId}/edit`);
  return { ok: true, id: data.id };
}

export async function deleteAttachment(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: row, error: getErr } = await supabase
    .from("case_attachments")
    .select("id, case_id, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (getErr) return { ok: false, error: getErr.message };
  if (!row) return { ok: false, error: "Attachment not found." };

  await supabase.storage.from("case-files").remove([row.storage_path]);
  const { error: delErr } = await supabase
    .from("case_attachments")
    .delete()
    .eq("id", id);
  if (delErr) return { ok: false, error: delErr.message };

  revalidatePath(`/cases/${row.case_id}`);
  revalidatePath(`/cases/${row.case_id}/edit`);
  return { ok: true };
}

export async function getAttachmentUrl(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("case_attachments")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!row) return null;

  const { data } = await supabase.storage
    .from("case-files")
    .createSignedUrl(row.storage_path, 60 * 5); // 5 min
  return data?.signedUrl ?? null;
}
