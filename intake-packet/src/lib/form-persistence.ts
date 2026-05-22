import { getPool } from "./db";
import { getFormBySlug, getFormDefs, type FormDef, type FormSlug } from "./forms-registry";

export type FormPayload = Record<string, unknown>;

function emptyDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
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
  if (def.booleanFields.has(field)) {
    return value ? ["yes"] : [];
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
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

export async function getPacketMeta(packetId: number) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT p.id, p.patient_id, p.date_of_accident, p.status, p.created_at,
            pt.full_name, pt.date_of_birth, pt.phone, pt.email
     FROM intake_packets p
     JOIN patients pt ON pt.id = p.patient_id
     WHERE p.id = $1`,
    [packetId],
  );
  return rows[0] ?? null;
}

export async function listPackets() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT p.id, p.status, p.date_of_accident, p.created_at, p.updated_at,
            pt.full_name, pt.phone
     FROM intake_packets p
     JOIN patients pt ON pt.id = p.patient_id
     ORDER BY p.updated_at DESC
     LIMIT 200`,
  );
  return rows;
}

export async function createPacket(input: {
  patientName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  dateOfAccident?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const patient = await client.query(
      `INSERT INTO patients (full_name, date_of_birth, phone, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        input.patientName || null,
        emptyDate(input.dateOfBirth),
        input.phone || null,
        input.email || null,
      ],
    );
    const patientId = patient.rows[0].id as number;
    const packet = await client.query(
      `INSERT INTO intake_packets (patient_id, date_of_accident, status)
       VALUES ($1, $2, 'in_progress')
       RETURNING id`,
      [patientId, emptyDate(input.dateOfAccident)],
    );
    await client.query("COMMIT");
    return { packetId: packet.rows[0].id as number, patientId };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function loadForm(packetId: number, slug: FormSlug): Promise<FormPayload> {
  const def = getFormBySlug(slug);
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT * FROM ${def.tableName} WHERE packet_id = $1 LIMIT 1`,
    [packetId],
  );
  if (!rows[0]) return {};
  const row = rows[0] as Record<string, unknown>;
  const data = rowToPayload(row, def);
  return slug === "intake" ? normalizeIntakePayload(data) : data;
}

export async function saveForm(
  packetId: number,
  slug: FormSlug,
  body: FormPayload,
): Promise<FormPayload> {
  const def = getFormBySlug(slug);
  let payload = { ...body };
  if (slug === "intake") payload = normalizeIntakePayload(payload);

  const columns = def.fieldNames.filter((name) => name in payload);
  const values = columns.map((name) => toDbValue(name, payload[name], def));

  const pool = getPool();
  const exists = await pool.query(
    `SELECT id FROM ${def.tableName} WHERE packet_id = $1`,
    [packetId],
  );

  if (exists.rows[0]) {
    const sets = columns.map((col, i) => `${col} = $${i + 2}`).join(", ");
    await pool.query(
      `UPDATE ${def.tableName} SET ${sets}, signed_at = COALESCE(signed_at, CURRENT_TIMESTAMP)
       WHERE packet_id = $1`,
      [packetId, ...values],
    );
  } else {
    const allCols = ["packet_id", ...columns];
    const placeholders = allCols.map((_, i) => `$${i + 1}`).join(", ");
    await pool.query(
      `INSERT INTO ${def.tableName} (${allCols.join(", ")})
       VALUES (${placeholders})`,
      [packetId, ...values],
    );
  }

  await pool.query(`UPDATE intake_packets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [
    packetId,
  ]);

  if (slug === "intake") {
    const name = String(payload.patient_name ?? "").trim();
    await pool.query(
      `UPDATE patients SET full_name = COALESCE(NULLIF($2, ''), full_name),
                           date_of_birth = COALESCE($3::date, date_of_birth),
                           phone = COALESCE(NULLIF($4, ''), phone),
                           email = COALESCE(NULLIF($5, ''), email),
                           updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT patient_id FROM intake_packets WHERE id = $1)`,
      [packetId, name || null, emptyDate(payload.dob), payload.phone_cell ?? null, payload.email ?? null],
    );
    if (payload.meta_date_of_accident) {
      await pool.query(
        `UPDATE intake_packets SET date_of_accident = $2::date, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [packetId, emptyDate(payload.meta_date_of_accident)],
      );
    }
  }

  return loadForm(packetId, slug);
}

export async function loadPacketForms(packetId: number) {
  const forms: Partial<Record<FormSlug, FormPayload>> = {};
  for (const def of getFormDefs()) {
    forms[def.slug] = await loadForm(packetId, def.slug);
  }
  const intake = forms.intake ?? {};
  return {
    packetId,
    forms,
    intakeLocalStorage: intake,
    localStorageKeys: Object.fromEntries(
      getFormDefs().map((f) => [f.localStorageKey, forms[f.slug] ?? {}]),
    ) as Record<string, FormPayload>,
  };
}

export function intakeSnapshotForPrefill(intake: FormPayload) {
  return {
    patient_name: intake.patient_name ?? "",
    dob: intake.dob ?? "",
    phone_cell: intake.phone_cell ?? "",
    email: intake.email ?? "",
    meta_date_of_accident: intake.meta_date_of_accident ?? "",
  };
}
