import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormSlug } from "./form-slugs";
import { getFormBySlug, getFormDefs, type FormDef } from "./forms-registry.server";
import {
  buildPatientUpdateFromIntake,
  syncCaseFromIntakeSave,
  syncPortalIntakeToCrm,
} from "./portal-crm-sync";

export type FormPayload = Record<string, unknown>;

/** Supabase/PostgREST errors are plain objects — not always `instanceof Error`. */
export function formatDbError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = String((err as { message: unknown }).message);
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Could not start intake";
}

function isMissingColumnError(message: string, column: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes(column.toLowerCase()) &&
    (m.includes("column") || m.includes("schema cache") || m.includes("could not find"))
  );
}

function emptyDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function patientRow(
  patients: unknown,
): {
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  phone?: string | null;
  email?: string | null;
} | null {
  if (!patients) return null;
  const row = Array.isArray(patients) ? patients[0] : patients;
  if (!row || typeof row !== "object") return null;
  const p = row as Record<string, unknown>;
  return {
    first_name: String(p.first_name ?? ""),
    last_name: String(p.last_name ?? ""),
    date_of_birth: emptyDate(p.date_of_birth),
    phone: emptyDate(p.phone),
    email: emptyDate(p.email),
  };
}

function splitPatientName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "Intake", last_name: "Pending" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "—" };
  if (parts.length === 2) return { first_name: parts[0], last_name: parts[1] };
  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(" "),
    last_name: parts[parts.length - 1],
  };
}

function toDbValue(field: string, value: unknown, def: FormDef): unknown {
  if (value === undefined) return null;
  if (def.jsonArrayFields.has(field)) {
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === "string" && value) return value;
    return null;
  }
  if (def.booleanFields.has(field)) {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    return Boolean(value);
  }
  if (Array.isArray(value)) return value.length ? value.join(",") : null;
  if (value === "") return null;
  return value;
}

function fromDbValue(field: string, value: unknown, def: FormDef): unknown {
  if (value === null || value === undefined) {
    if (def.booleanFields.has(field)) return [];
    return def.jsonArrayFields.has(field) ? [] : "";
  }
  if (def.jsonArrayFields.has(field)) {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
  if (def.booleanFields.has(field)) return value ? ["yes"] : [];
  return value;
}

function rowToPayload(row: Record<string, unknown>, def: FormDef): FormPayload {
  const data: FormPayload = {};
  for (const field of def.fieldNames) {
    if (field in row) data[field] = fromDbValue(field, row[field], def);
  }
  return data;
}

function normalizeIntakePayload(data: FormPayload): FormPayload {
  const out = { ...data };
  const first = String(out.patient_first_name ?? "").trim();
  const middle = String(out.patient_middle ?? "").trim();
  const last = String(out.patient_last_name ?? "").trim();
  if (!String(out.patient_name ?? "").trim() && (first || last)) {
    out.patient_name = [first, middle, last].filter(Boolean).join(" ");
  }
  return out;
}

export async function getPacketMeta(supabase: SupabaseClient, packetId: number) {
  const { data, error } = await supabase
    .from("intake_packets")
    .select(
      "id, patient_id, case_id, date_of_accident, status, created_at, patients(first_name, last_name, date_of_birth, phone, email)",
    )
    .eq("id", packetId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const pt = patientRow(data.patients);

  return {
    id: data.id,
    patient_id: data.patient_id,
    case_id: data.case_id as string | null,
    date_of_accident: data.date_of_accident,
    status: data.status,
    created_at: data.created_at,
    full_name: pt ? `${pt.first_name} ${pt.last_name}`.trim() : null,
    date_of_birth: pt?.date_of_birth ?? null,
    phone: pt?.phone ?? null,
    email: pt?.email ?? null,
  };
}

export async function listPackets(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("intake_packets")
    .select(
      "id, status, date_of_accident, created_at, updated_at, patients(first_name, last_name, phone)",
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const pt = patientRow(row.patients);
    return {
      id: row.id,
      status: row.status,
      date_of_accident: row.date_of_accident,
      created_at: row.created_at,
      updated_at: row.updated_at,
      full_name: pt ? `${pt.first_name} ${pt.last_name}`.trim() : null,
      phone: pt?.phone ?? null,
    };
  });
}

export async function createPortalPacket(
  supabase: SupabaseClient,
  createdBy: string | null,
) {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const { data: patient, error: pErr } = await supabase
    .from("patients")
    .insert({
      first_name: "Intake",
      last_name: `Pending ${stamp}`,
      status: "active",
      created_by: createdBy,
    })
    .select("id")
    .single();

  if (pErr || !patient) throw pErr ?? new Error("Could not create patient");

  const patientId = patient.id;

  let caseId: string | null = null;
  const { data: caseRow, error: cErr } = await supabase
    .from("cases")
    .insert({
      patient_id: patientId,
      case_type: "mva",
      status: "open",
      billing_method: "insurance",
      description: "Portal intake in progress",
    })
    .select("id")
    .single();

  if (!cErr && caseRow?.id) {
    caseId = caseRow.id as string;
  } else if (cErr) {
    console.error("createPortalPacket: case insert failed:", cErr.message);
  }

  const basePacket = {
    patient_id: patientId,
    status: "in_progress" as const,
    source: "portal" as const,
  };

  async function rollbackCreated() {
    if (caseId) await supabase.from("cases").delete().eq("id", caseId);
    await supabase.from("patients").delete().eq("id", patientId);
  }

  let packetId: number;

  if (caseId) {
    const { data: packet, error: kErr } = await supabase
      .from("intake_packets")
      .insert({ ...basePacket, case_id: caseId })
      .select("id")
      .single();

    if (!kErr && packet) {
      packetId = packet.id as number;
    } else if (kErr && isMissingColumnError(kErr.message, "case_id")) {
      const { data: packet2, error: kErr2 } = await supabase
        .from("intake_packets")
        .insert(basePacket)
        .select("id")
        .single();
      if (kErr2) {
        await rollbackCreated();
        throw kErr2;
      }
      packetId = packet2!.id as number;
    } else {
      await rollbackCreated();
      throw kErr ?? new Error("Could not create intake packet");
    }
  } else {
    const { data: packet, error: kErr } = await supabase
      .from("intake_packets")
      .insert(basePacket)
      .select("id")
      .single();
    if (kErr) {
      await supabase.from("patients").delete().eq("id", patientId);
      throw kErr;
    }
    packetId = packet!.id as number;
  }

  return {
    packetId,
    patientId,
    caseId,
  };
}

export async function loadForm(
  supabase: SupabaseClient,
  packetId: number,
  slug: FormSlug,
): Promise<FormPayload> {
  const def = getFormBySlug(slug);
  const { data, error } = await supabase
    .from(def.tableName)
    .select("*")
    .eq("packet_id", packetId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return {};

  const row = data as Record<string, unknown>;
  const payload = rowToPayload(row, def);
  return slug === "intake" ? normalizeIntakePayload(payload) : payload;
}

export async function saveForm(
  supabase: SupabaseClient,
  packetId: number,
  slug: FormSlug,
  body: FormPayload,
): Promise<FormPayload> {
  const def = getFormBySlug(slug);
  let payload = { ...body };
  if (slug === "intake") payload = normalizeIntakePayload(payload);

  const row: Record<string, unknown> = { packet_id: packetId };
  for (const name of def.fieldNames) {
    if (name in payload) row[name] = toDbValue(name, payload[name], def);
  }

  const { data: existing } = await supabase
    .from(def.tableName)
    .select("id")
    .eq("packet_id", packetId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from(def.tableName).update(row).eq("packet_id", packetId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(def.tableName).insert(row);
    if (error) throw error;
  }

  await supabase
    .from("intake_packets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", packetId);

  if (slug === "intake") {
    const { data: pkt } = await supabase
      .from("intake_packets")
      .select("patient_id")
      .eq("id", packetId)
      .single();

    if (pkt?.patient_id) {
      const patientUpdate = buildPatientUpdateFromIntake(payload);
      if (Object.keys(patientUpdate).length > 0) {
        await supabase.from("patients").update(patientUpdate).eq("id", pkt.patient_id);
      }

      await syncCaseFromIntakeSave(supabase, packetId, pkt.patient_id, payload);
    }
  }

  return loadForm(supabase, packetId, slug);
}

export async function loadPacketForms(supabase: SupabaseClient, packetId: number) {
  const forms: Partial<Record<FormSlug, FormPayload>> = {};
  for (const def of getFormDefs()) {
    forms[def.slug] = await loadForm(supabase, packetId, def.slug);
  }
  return { packetId, forms };
}

export async function completePacket(supabase: SupabaseClient, packetId: number) {
  const intake = await loadForm(supabase, packetId, "intake");
  const financial = await loadForm(supabase, packetId, "financial");
  const hipaa = await loadForm(supabase, packetId, "hipaa");

  await syncPortalIntakeToCrm(supabase, packetId, { intake, financial, hipaa });
}
