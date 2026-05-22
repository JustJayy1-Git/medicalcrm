import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormSlug } from "./form-slugs";
import { getFormBySlug, getFormDefs, type FormDef } from "./forms-registry.server";

export type FormPayload = Record<string, unknown>;

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
      "id, patient_id, date_of_accident, status, created_at, patients(first_name, last_name, date_of_birth, phone, email)",
    )
    .eq("id", packetId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const pt = patientRow(data.patients);

  return {
    id: data.id,
    patient_id: data.patient_id,
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

  if (pErr) throw pErr;

  const { data: packet, error: kErr } = await supabase
    .from("intake_packets")
    .insert({
      patient_id: patient.id,
      status: "in_progress",
      source: "portal",
    })
    .select("id")
    .single();

  if (kErr) throw kErr;

  return { packetId: packet.id as number, patientId: patient.id as string };
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
      const name = String(payload.patient_name ?? "").trim();
      const names = name ? splitPatientName(name) : null;
      const patientUpdate: Record<string, string | null> = {};
      if (names) {
        patientUpdate.first_name = names.first_name;
        patientUpdate.last_name = names.last_name;
        if (names.middle_name) patientUpdate.middle_name = names.middle_name;
      }
      const dob = emptyDate(payload.dob);
      if (dob) patientUpdate.date_of_birth = dob;
      if (payload.phone_cell) patientUpdate.phone = String(payload.phone_cell);
      if (payload.email) patientUpdate.email = String(payload.email);
      if (Object.keys(patientUpdate).length > 0) {
        await supabase.from("patients").update(patientUpdate).eq("id", pkt.patient_id);
      }

      if (payload.meta_date_of_accident) {
        await supabase
          .from("intake_packets")
          .update({ date_of_accident: emptyDate(payload.meta_date_of_accident) })
          .eq("id", packetId);
      }
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
  const { data: packet, error: packetErr } = await supabase
    .from("intake_packets")
    .select("patient_id, date_of_accident, status")
    .eq("id", packetId)
    .single();

  if (packetErr) throw packetErr;

  const intake = await loadForm(supabase, packetId, "intake");
  const doi =
    packet.date_of_accident ?? emptyDate(intake.meta_date_of_accident);

  if (packet.patient_id) {
    const name = String(intake.patient_name ?? "").trim();
    const names = name ? splitPatientName(name) : null;
    const patientUpdate: Record<string, string | null> = {};
    if (names) {
      patientUpdate.first_name = names.first_name;
      patientUpdate.last_name = names.last_name;
      if (names.middle_name) patientUpdate.middle_name = names.middle_name;
    }
    const dob = emptyDate(intake.dob);
    if (dob) patientUpdate.date_of_birth = dob;
    if (intake.phone_cell) patientUpdate.phone = String(intake.phone_cell);
    if (intake.email) patientUpdate.email = String(intake.email);
    if (intake.addr_street) patientUpdate.address_line1 = String(intake.addr_street);
    if (intake.addr_city) patientUpdate.city = String(intake.addr_city);
    if (intake.addr_state) patientUpdate.state = String(intake.addr_state);
    if (intake.addr_zip) patientUpdate.zip = String(intake.addr_zip);
    if (Object.keys(patientUpdate).length > 0) {
      await supabase.from("patients").update(patientUpdate).eq("id", packet.patient_id);
    }
  }

  const { error } = await supabase
    .from("intake_packets")
    .update({ status: "completed", date_of_accident: doi })
    .eq("id", packetId);
  if (error) throw error;

  if (packet.patient_id) {
    const { data: openCase } = await supabase
      .from("cases")
      .select("id")
      .eq("patient_id", packet.patient_id)
      .in("status", ["open", "active"])
      .maybeSingle();

    if (!openCase) {
      const summary = intake.acc_summary ? String(intake.acc_summary).trim() : "";
      await supabase.from("cases").insert({
        patient_id: packet.patient_id,
        case_type: "mva",
        status: "open",
        billing_method: "insurance",
        date_of_injury: doi,
        description: summary ? summary.slice(0, 500) : "Portal intake",
        how_it_happened: summary || null,
      });
    }
  }
}
