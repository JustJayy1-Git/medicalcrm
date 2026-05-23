import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormPayload } from "./form-persistence";

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s || null;
}

function emptyDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function yesNo(value: unknown): boolean | null {
  const raw = str(value)?.toLowerCase();
  if (!raw) return null;
  if (raw.includes("yes") || raw === "true") return true;
  if (raw.includes("no") || raw === "false") return false;
  return null;
}

function mapSex(gender: unknown): string | null {
  const g = str(gender)?.toLowerCase();
  if (!g) return null;
  if (g.includes("female") || g === "f") return "F";
  if (g.includes("male") || g === "m") return "M";
  return "X";
}

function mapLanguage(language: unknown): string | null {
  const l = str(language)?.toLowerCase();
  if (!l) return null;
  if (l.includes("spanish") || l === "es") return "es";
  if (l.includes("creole") || l === "ht") return "ht";
  return "en";
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

function inferCaseType(accidentType: unknown): string {
  const t = str(accidentType)?.toLowerCase() ?? "";
  if (t.includes("work") || t.includes("comp")) return "workers_comp";
  if (t.includes("slip") || t.includes("fall") || t.includes("premise")) return "slip_fall";
  if (t.includes("car") || t.includes("auto") || t.includes("mva") || t.includes("vehicle")) {
    return "mva";
  }
  if (t.includes("other")) return "other";
  return "mva";
}

/** Map page-1 intake fields → CRM `patients` columns. */
export function buildPatientUpdateFromIntake(intake: FormPayload): Record<string, string> {
  const update: Record<string, string> = {};

  const name = str(intake.patient_name);
  if (name) {
    const names = splitPatientName(name);
    update.first_name = names.first_name;
    update.last_name = names.last_name;
    if (names.middle_name) update.middle_name = names.middle_name;
  }

  const dob = emptyDate(intake.dob);
  if (dob) update.date_of_birth = dob;

  const cell = str(intake.phone_cell);
  if (cell) {
    update.phone_cell = cell;
    update.phone = cell;
  }

  const home = str(intake.phone_home);
  if (home) update.phone_home = home;

  const email = str(intake.email);
  if (email) update.email = email;

  const street = str(intake.addr_street);
  if (street) update.address_line1 = street;
  const city = str(intake.addr_city);
  if (city) update.city = city;
  const state = str(intake.addr_state);
  if (state) update.state = state;
  const zip = str(intake.addr_zip);
  if (zip) update.zip = zip;

  const sex = mapSex(intake.gender);
  if (sex) update.sex = sex;

  const language = mapLanguage(intake.language);
  if (language) update.language = language;

  const emergency = str(intake.emergency_contact);
  if (emergency) update.emergency_name = emergency;

  return update;
}

async function findCarrierId(
  supabase: SupabaseClient,
  carrierName: string | null,
): Promise<string | null> {
  if (!carrierName) return null;
  const { data } = await supabase
    .from("insurance_carriers")
    .select("id")
    .ilike("name", carrierName)
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

async function findAttorneyId(
  supabase: SupabaseClient,
  attorneyName: string | null,
  firmName: string | null,
): Promise<string | null> {
  if (attorneyName) {
    const { data } = await supabase
      .from("attorneys")
      .select("id")
      .ilike("attorney_name", attorneyName)
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  if (firmName) {
    const { data } = await supabase
      .from("attorneys")
      .select("id")
      .ilike("firm_name", firmName)
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  return null;
}

/** Map portal intake forms → CRM `cases` row (open PI case). */
export async function buildCasePayloadFromPortalForms(
  supabase: SupabaseClient,
  intake: FormPayload,
  financial: FormPayload,
  hipaa: FormPayload,
  doi: string | null,
): Promise<Record<string, unknown>> {
  const summary = str(intake.acc_summary);
  const referralRaw = str(hipaa.referral_source) ?? str(intake.meta_referred_by);
  const referral =
    referralRaw === "other"
      ? str(hipaa.referral_source_other) ?? str(intake.meta_referred_by)
      : referralRaw;

  const payload: Record<string, unknown> = {
    case_type: inferCaseType(intake.meta_type_of_accident),
    status: "open",
    billing_method: "insurance",
    date_of_injury: doi,
    referral_source: referral,
    accident_nature: str(intake.meta_type_of_accident),
    accident_state: str(intake.addr_state),
    description: summary ? summary.slice(0, 500) : "Portal intake",
    how_it_happened: summary,
    fault_notes: str(intake.acc_time_location),
    police_report_num: str(intake.acc_crash_report),
    pain_notes: str(intake.inj_initial),
  };

  const claim = str(intake.pip_claim);
  if (claim) payload.primary_claim_number = claim;
  const policy = str(intake.pip_policy);
  if (policy) payload.primary_policy_number = policy;
  const adjuster = str(intake.pip_adjuster);
  if (adjuster) payload.primary_adjuster_name = adjuster;

  const carrierId = await findCarrierId(supabase, str(intake.pip_carrier));
  if (carrierId) payload.primary_carrier_id = carrierId;

  const attorneyId = await findAttorneyId(
    supabase,
    str(financial.attorney_name),
    str(financial.attorney_firm),
  );
  if (attorneyId) payload.attorney_id = attorneyId;

  const ambulance = yesNo(intake.rescue);
  if (ambulance !== null) payload.ambulance = ambulance;
  const erVisit = yesNo(intake.hospital);
  if (erVisit !== null) payload.er_visit = erVisit;
  const hospital = str(intake.hospital_name);
  if (hospital) payload.er_visit_facility = hospital;

  const treating = str(intake.inj_treating_facility);
  if (treating) {
    const pain = str(payload.pain_notes as string | undefined);
    payload.pain_notes = pain ? `${pain}\nTreating facility: ${treating}` : treating;
  }

  const clientRole = str(intake.client_role);
  if (clientRole) {
    const notes = str(payload.fault_notes as string | undefined);
    payload.fault_notes = notes
      ? `${notes}\nClient role: ${clientRole}`
      : `Client role: ${clientRole}`;
  }

  const comments: string[] = [];
  if (str(intake.pip_carrier) && !carrierId) {
    comments.push(`Insurance carrier (intake): ${intake.pip_carrier}`);
  }
  if (str(financial.attorney_firm) && !attorneyId) {
    comments.push(`Attorney firm (intake): ${financial.attorney_firm}`);
  }
  if (str(financial.attorney_name) && !attorneyId) {
    comments.push(`Attorney (intake): ${financial.attorney_name}`);
  }
  if (str(financial.attorney_phone)) {
    comments.push(`Attorney phone (intake): ${financial.attorney_phone}`);
  }
  if (comments.length > 0) payload.comments = comments.join("\n");

  return payload;
}

/** Create or update the CRM case while the patient fills page 1 on the iPad. */
export async function syncCaseFromIntakeSave(
  supabase: SupabaseClient,
  packetId: number,
  patientId: string,
  intake: FormPayload,
): Promise<string | null> {
  let linkedCaseId: string | null = null;
  let packetDoi: string | null = null;

  const { data: packetLinked, error: linkedErr } = await supabase
    .from("intake_packets")
    .select("case_id, date_of_accident")
    .eq("id", packetId)
    .single();

  if (!linkedErr && packetLinked) {
    linkedCaseId = (packetLinked.case_id as string | null) ?? null;
    packetDoi = (packetLinked.date_of_accident as string | null) ?? null;
  } else {
    const { data: packetBasic, error: basicErr } = await supabase
      .from("intake_packets")
      .select("date_of_accident")
      .eq("id", packetId)
      .single();
    if (basicErr) throw basicErr;
    packetDoi = (packetBasic?.date_of_accident as string | null) ?? null;
  }

  const doi = emptyDate(intake.meta_date_of_accident) ?? emptyDate(packetDoi);
  const casePayload = await buildCasePayloadFromPortalForms(supabase, intake, {}, {}, doi);
  casePayload.patient_id = patientId;

  let caseId: string | null = linkedCaseId;

  if (caseId) {
    const { error: caseErr } = await supabase.from("cases").update(casePayload).eq("id", caseId);
    if (caseErr) throw caseErr;
  } else {
    const { data: created, error: insertErr } = await supabase
      .from("cases")
      .insert(casePayload)
      .select("id")
      .single();
    if (insertErr) throw insertErr;
    caseId = created.id as string;
  }

  const packetUpdate: Record<string, unknown> = {};
  if (doi) packetUpdate.date_of_accident = doi;

  if (caseId && caseId !== linkedCaseId) {
    const { error: linkErr } = await supabase
      .from("intake_packets")
      .update({ ...packetUpdate, case_id: caseId })
      .eq("id", packetId);
    if (linkErr && !String(linkErr.message).toLowerCase().includes("case_id")) {
      throw linkErr;
    }
    if (linkErr && Object.keys(packetUpdate).length > 0) {
      const { error: doiErr } = await supabase
        .from("intake_packets")
        .update(packetUpdate)
        .eq("id", packetId);
      if (doiErr) throw doiErr;
    }
  } else if (Object.keys(packetUpdate).length > 0) {
    const { error: pktErr } = await supabase
      .from("intake_packets")
      .update(packetUpdate)
      .eq("id", packetId);
    if (pktErr) throw pktErr;
  }

  return caseId;
}

export type PortalCrmSyncResult = {
  patientId: string;
  caseId: string | null;
};

/**
 * On Finish: copy portal intake into CRM patient chart + open case
 * (claim #, policy, adjuster, accident info, attorney when matched).
 */
export async function syncPortalIntakeToCrm(
  supabase: SupabaseClient,
  packetId: number,
  forms: {
    intake: FormPayload;
    financial: FormPayload;
    hipaa: FormPayload;
  },
): Promise<PortalCrmSyncResult> {
  const { data: packet, error: packetErr } = await supabase
    .from("intake_packets")
    .select("patient_id, date_of_accident, status, case_id")
    .eq("id", packetId)
    .single();

  if (packetErr) throw packetErr;
  if (!packet.patient_id) throw new Error("Intake packet has no patient");

  const { intake, financial, hipaa } = forms;
  const doi = packet.date_of_accident ?? emptyDate(intake.meta_date_of_accident);

  const patientUpdate = buildPatientUpdateFromIntake(intake);
  if (Object.keys(patientUpdate).length > 0) {
    const { error: patientErr } = await supabase
      .from("patients")
      .update(patientUpdate)
      .eq("id", packet.patient_id);
    if (patientErr) throw patientErr;
  }

  const casePayload = await buildCasePayloadFromPortalForms(
    supabase,
    intake,
    financial,
    hipaa,
    doi,
  );
  casePayload.patient_id = packet.patient_id;

  let caseId: string | null = packet.case_id ?? null;

  if (caseId) {
    const { error: caseErr } = await supabase.from("cases").update(casePayload).eq("id", caseId);
    if (caseErr) throw caseErr;
  } else {
    const { data: linkedCase } = await supabase
      .from("cases")
      .select("id")
      .eq("patient_id", packet.patient_id)
      .in("status", ["open", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (linkedCase?.id) {
      caseId = linkedCase.id;
      const { error: caseErr } = await supabase.from("cases").update(casePayload).eq("id", caseId);
      if (caseErr) throw caseErr;
    } else {
      const { data: created, error: insertErr } = await supabase
        .from("cases")
        .insert(casePayload)
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      caseId = created.id as string;
    }
  }

  const { error: packetUpdateErr } = await supabase
    .from("intake_packets")
    .update({
      status: "completed",
      date_of_accident: doi,
      case_id: caseId,
    })
    .eq("id", packetId);
  if (packetUpdateErr) throw packetUpdateErr;

  return { patientId: packet.patient_id, caseId };
}
