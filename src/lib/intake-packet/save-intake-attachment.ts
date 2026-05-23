import "server-only";

import { createAdminClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";
import { compileIntakePacketHtml } from "./compile-intake-document";
import type { FormPayload } from "./form-persistence";
import type { FormSlug } from "./form-slugs";

/** Save compiled intake HTML to the patient case file folder (Supabase Storage). */
export async function saveIntakePacketToPatientFile(opts: {
  packetId: number;
  patientId: string;
  caseId: string;
  patientName: string;
  forms: Partial<Record<FormSlug, FormPayload>>;
}): Promise<void> {
  const admin = createAdminClient();

  const label = `Intake packet #${opts.packetId}`;
  const { data: existing } = await admin
    .from("case_attachments")
    .select("id")
    .eq("case_id", opts.caseId)
    .eq("kind", "intake_packet")
    .eq("label", label)
    .maybeSingle();

  if (existing) return;

  const html = compileIntakePacketHtml({
    packetId: opts.packetId,
    patientName: opts.patientName,
    completedAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
    forms: opts.forms,
  });

  const bytes = Buffer.from(html, "utf8");
  const path = `${opts.caseId}/intake_packet/${opts.packetId}-${randomUUID().slice(0, 8)}.html`;

  const { error: upErr } = await admin.storage.from("case-files").upload(path, bytes, {
    contentType: "text/html; charset=utf-8",
    upsert: false,
  });
  if (upErr) throw upErr;

  const { error: rowErr } = await admin.from("case_attachments").insert({
    case_id: opts.caseId,
    patient_id: opts.patientId,
    kind: "intake_packet",
    label,
    storage_path: path,
    mime_type: "text/html",
    size_bytes: bytes.byteLength,
    uploaded_by: null,
  });

  if (rowErr) {
    await admin.storage.from("case-files").remove([path]);
    throw rowErr;
  }
}
