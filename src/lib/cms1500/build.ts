import { lineAmount } from "@/lib/charge-ledger";
import { getPracticeFromEnv, mergePracticeWithFacility } from "@/lib/practice";
import {
  buildDiagnosisIndex,
  diagnosisPointers,
  formatAddress,
  formatPatientName,
  splitIsoDate,
} from "./format";
import type { Cms1500Claim, Cms1500ServiceLine } from "./types";

const LINES_PER_PAGE = 6;

type PatientRow = {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
  chart_number?: string | null;
  phone?: string | null;
  phone_cell?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  signature_on_file?: boolean | null;
  employer_name?: string | null;
};

type CarrierRow = {
  name: string;
  payer_id?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

type ProviderRow = {
  full_name: string;
  credentials?: string | null;
  npi?: string | null;
};

type ChargeInput = {
  cpt_code: string | null;
  modifier?: string | null;
  units?: number | null;
  fee?: number | string | null;
  icd_codes?: string[] | null;
};

export type BuildClaimInput = {
  caseId: string;
  visitId: string;
  dateOfService: string;
  page: number;
  pageCount: number;
  patient: PatientRow;
  caseRow: {
    case_type?: string | null;
    date_of_injury?: string | null;
    primary_policy_number?: string | null;
    primary_claim_number?: string | null;
    primary_group_number?: string | null;
    accept_assignment?: boolean | null;
    accident_state?: string | null;
    diagnosis_codes?: string[] | null;
    unable_to_work_from?: string | null;
    unable_to_work_to?: string | null;
    hospitalization_from?: string | null;
    hospitalization_to?: string | null;
    authorization_number?: string | null;
  };
  carrier: CarrierRow | null;
  facility: {
    name?: string | null;
    npi?: string | null;
    tax_id?: string | null;
    phone?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  } | null;
  renderingProvider: ProviderRow | null;
  charges: ChargeInput[];
  placeOfService?: string;
};

function providerLabel(p: ProviderRow | null) {
  if (!p) return "";
  const cred = p.credentials?.trim();
  return cred ? `${p.full_name}, ${cred}` : p.full_name;
}

function buildServiceLines(
  dos: string,
  charges: ChargeInput[],
  diagnosisIndex: string[],
  renderingNpi: string,
  placeOfService: string,
): Cms1500ServiceLine[] {
  const parts = splitIsoDate(dos);
  return charges.map((c) => ({
    from: parts,
    to: parts,
    placeOfService,
    cpt: c.cpt_code?.trim() ?? "",
    modifier: c.modifier?.trim() ?? "",
    diagnosisPointer: diagnosisPointers(c.icd_codes, diagnosisIndex),
    charges: lineAmount(c).toFixed(2),
    units: String(c.units ?? 1),
    renderingNpi,
  }));
}

function baseClaim(input: BuildClaimInput): Omit<Cms1500Claim, "serviceLines" | "meta"> {
  const { patient: p, caseRow: c, carrier, facility, renderingProvider } = input;
  const practice = mergePracticeWithFacility(getPracticeFromEnv(), facility);
  const patientAddr = formatAddress(p);
  const carrierAddr = carrier ? formatAddress(carrier) : patientAddr;
  const isMva = c.case_type === "mva";

  const diagnosisFromCase = Array.isArray(c.diagnosis_codes) ? c.diagnosis_codes : [];
  const diagnosisFromCharges = input.charges.flatMap((ch) => ch.icd_codes ?? []);
  const diagnosisCodes = buildDiagnosisIndex([
    ...diagnosisFromCase,
    ...diagnosisFromCharges,
  ]);

  const total = input.charges.reduce((s, ch) => s + lineAmount(ch), 0);

  return {
    insuranceType: {
      medicare: false,
      medicaid: false,
      tricare: false,
      champva: false,
      groupHealth: false,
      feca: false,
      other: true,
    },
    insuredId: c.primary_policy_number?.trim() ?? "",
    patientName: formatPatientName(p),
    patientBirth: splitIsoDate(p.date_of_birth),
    patientSex: p.sex === "M" || p.sex === "F" ? p.sex : "",
    insuredName: formatPatientName(p),
    patientAddress: patientAddr.street,
    patientCity: patientAddr.city,
    patientState: patientAddr.state,
    patientZip: patientAddr.zip,
    patientPhone: (p.phone_cell ?? p.phone ?? "").trim(),
    relationshipSelf: true,
    relationshipSpouse: false,
    relationshipChild: false,
    relationshipOther: false,
    insuredAddress: carrierAddr.street || patientAddr.street,
    insuredCity: carrierAddr.city || patientAddr.city,
    insuredState: carrierAddr.state || patientAddr.state,
    insuredZip: carrierAddr.zip || patientAddr.zip,
    reserved: "",
    otherInsuredName: "",
    otherInsuredPolicy: "",
    otherInsuredBirth: { mm: "", dd: "", yy: "" },
    otherInsuredSex: "",
    employerName: p.employer_name?.trim() ?? "",
    conditionRelated: {
      employment: false,
      autoAccident: isMva,
      autoAccidentState: c.accident_state?.trim() ?? "",
      otherAccident: c.case_type === "slip_fall",
    },
    policyGroup: c.primary_group_number?.trim() ?? "",
    patientSignatureOnFile: p.signature_on_file === true,
    insuredSignatureOnFile: true,
    dateOfInjury: splitIsoDate(c.date_of_injury),
    otherDate: { mm: "", dd: "", yy: "" },
    unableToWorkFrom: splitIsoDate(c.unable_to_work_from),
    unableToWorkTo: splitIsoDate(c.unable_to_work_to),
    referringProvider: providerLabel(renderingProvider),
    referringNpi: renderingProvider?.npi?.trim() ?? "",
    hospitalizationFrom: splitIsoDate(c.hospitalization_from),
    hospitalizationTo: splitIsoDate(c.hospitalization_to),
    outsideLab: false,
    outsideLabCharges: "",
    diagnosisCodes,
    resubmissionCode: "",
    originalRef: c.primary_claim_number?.trim() ?? "",
    priorAuth: c.authorization_number?.trim() ?? "",
    taxId: practice.taxId,
    taxIdTypeEin: true,
    taxIdTypeSsn: false,
    patientAccount: p.chart_number?.trim() ?? "",
    acceptAssignment: c.accept_assignment !== false,
    totalCharge: total.toFixed(2),
    amountPaid: "0.00",
    balanceDue: total.toFixed(2),
    physicianSignature: providerLabel(renderingProvider),
    serviceFacility: {
      name: facility?.name?.trim() || practice.name,
      address: facility
        ? formatAddress(facility).street
        : [practice.addressLine1, practice.addressLine2].filter(Boolean).join(", "),
      city: facility?.city?.trim() || practice.city,
      state: facility?.state?.trim() || practice.state,
      zip: facility?.zip?.trim() || practice.zip,
      npi: facility?.npi?.trim() || practice.npi,
    },
    billingProvider: {
      name: practice.name,
      address: [practice.addressLine1, practice.addressLine2]
        .filter(Boolean)
        .join(", "),
      city: practice.city,
      state: practice.state,
      zip: practice.zip,
      phone: practice.phone,
      npi: practice.npi,
    },
    carrierName: carrier?.name?.trim() ?? "",
    carrierAddress: carrier ? formatAddress(carrier).full : "",
  };
}

/** One CMS-1500 page (up to 6 service lines). */
export function buildCms1500Page(input: BuildClaimInput): Cms1500Claim {
  const diagnosisFromCase = Array.isArray(input.caseRow.diagnosis_codes)
    ? input.caseRow.diagnosis_codes
    : [];
  const diagnosisFromCharges = input.charges.flatMap((ch) => ch.icd_codes ?? []);
  const diagnosisIndex = buildDiagnosisIndex([
    ...diagnosisFromCase,
    ...diagnosisFromCharges,
  ]);
  const pos = input.placeOfService ?? "11";
  const npi = input.renderingProvider?.npi?.trim() ?? "";
  const base = baseClaim(input);

  return {
    ...base,
    meta: {
      caseId: input.caseId,
      visitId: input.visitId,
      dateOfService: input.dateOfService,
      page: input.page,
      pageCount: input.pageCount,
    },
    serviceLines: buildServiceLines(
      input.dateOfService,
      input.charges,
      diagnosisIndex,
      npi,
      pos,
    ),
  };
}

/** E/M consult codes (initial / follow-up / final consults) — 99xxx. */
function isConsultCode(code: string | null | undefined): boolean {
  return Boolean(code && code.startsWith("99"));
}

/**
 * Claims for one treatment day, following the practice's billing rule:
 * every consult (initial / follow-up / final, 99xxx) prints on its own
 * separate CMS-1500, and therapy/modality lines print on theirs — chunked
 * six per form (box 24) so nothing is ever silently dropped.
 */
export function buildCms1500Pages(
  input: Omit<BuildClaimInput, "page" | "pageCount" | "charges"> & {
    charges: ChargeInput[];
  },
): Cms1500Claim[] {
  const consults = input.charges.filter((ch) => isConsultCode(ch.cpt_code));
  const therapy = input.charges.filter((ch) => !isConsultCode(ch.cpt_code));

  const groups: ChargeInput[][] = [];
  for (const consult of consults) {
    groups.push([consult]);
  }
  for (let at = 0; at < therapy.length; at += LINES_PER_PAGE) {
    groups.push(therapy.slice(at, at + LINES_PER_PAGE));
  }

  if (groups.length === 0) return [];

  return groups.map((charges, idx) =>
    buildCms1500Page({
      ...input,
      charges,
      page: idx + 1,
      pageCount: groups.length,
    }),
  );
}
