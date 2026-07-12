/**
 * Field positions on NUCC CMS-1500 (02/12) — letter 612×792 pt.
 * Values are % from top-left of the claim face (page 1 of blank PDF).
 * Calibrated for standard red CMS-1500; scales if template size differs.
 */
export type PercentBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Reference size (US Letter PDF points). */
export const CMS1500_REF_WIDTH = 612;
export const CMS1500_REF_HEIGHT = 792;

export const CMS1500_FIELDS = {
  /* Payer mailing block (top-right margin, as on the practice's claims). */
  carrierName: { left: 60, top: 2.6, width: 38, height: 2 },
  carrierAddress1: { left: 60, top: 4.2, width: 38, height: 2 },
  carrierAddress2: { left: 60, top: 5.8, width: 38, height: 2 },
  insuredId: { left: 68, top: 7.6, width: 30, height: 2.2 },
  patientName: { left: 4, top: 12.2, width: 40, height: 2.5 },
  patientBirthMm: { left: 47.5, top: 12.2, width: 3.5, height: 2.5 },
  patientBirthDd: { left: 51.5, top: 12.2, width: 3.5, height: 2.5 },
  patientBirthYy: { left: 55.5, top: 12.2, width: 4, height: 2.5 },
  patientSexM: { left: 60.5, top: 12.2, width: 2.5, height: 2.5 },
  patientSexF: { left: 63.5, top: 12.2, width: 2.5, height: 2.5 },
  insuredName: { left: 4, top: 15.8, width: 40, height: 2.5 },
  patientStreet: { left: 4, top: 19.2, width: 58, height: 2.5 },
  patientCity: { left: 4, top: 22.2, width: 28, height: 2.5 },
  patientState: { left: 33, top: 22.2, width: 5, height: 2.5 },
  patientZip: { left: 39, top: 22.2, width: 10, height: 2.5 },
  patientPhone: { left: 50, top: 22.2, width: 16, height: 2.5 },
  insuredStreet: { left: 68, top: 22.2, width: 30, height: 2.5 },
  insuredCity: { left: 68, top: 25.2, width: 18, height: 2.5 },
  insuredState: { left: 87, top: 25.2, width: 4, height: 2.5 },
  insuredZip: { left: 92, top: 25.2, width: 8, height: 2.5 },
  policyGroup: { left: 68, top: 34.8, width: 30, height: 2.5 },
  /* Boxes 12/13 — signature on file. */
  patientSignature12: { left: 12, top: 36.3, width: 26, height: 2.2 },
  insuredSignature13: { left: 72, top: 36.3, width: 24, height: 2.2 },
  injuryMm: { left: 4, top: 38.2, width: 3.5, height: 2.5 },
  injuryDd: { left: 8, top: 38.2, width: 3.5, height: 2.5 },
  injuryYy: { left: 12, top: 38.2, width: 4, height: 2.5 },
  /* Box 17 / 17b — referring provider. */
  referringProvider: { left: 5.5, top: 40.3, width: 27, height: 2.2 },
  referringNpi: { left: 36, top: 40.3, width: 14, height: 2.2 },
  priorAuth: { left: 68, top: 41.5, width: 30, height: 2.5 },
  taxId: { left: 4, top: 72.2, width: 22, height: 2.5 },
  patientAccount: { left: 44, top: 72.2, width: 18, height: 2.5 },
  acceptYes: { left: 68, top: 72.2, width: 3, height: 2.5 },
  acceptNo: { left: 72, top: 72.2, width: 3, height: 2.5 },
  totalCharge: { left: 78, top: 72.2, width: 12, height: 2.5 },
  physicianSignature: { left: 6, top: 75.8, width: 38, height: 2.5 },
  facilityName: { left: 4, top: 79.2, width: 44, height: 2.5 },
  facilityStreet: { left: 4, top: 81.5, width: 44, height: 2.5 },
  facilityCity: { left: 4, top: 83.8, width: 18, height: 2.5 },
  facilityState: { left: 23, top: 83.8, width: 4, height: 2.5 },
  facilityZip: { left: 28, top: 83.8, width: 8, height: 2.5 },
  facilityNpi: { left: 38, top: 83.8, width: 12, height: 2.5 },
  billingName: { left: 52, top: 79.2, width: 44, height: 2.5 },
  billingStreet: { left: 52, top: 81.5, width: 44, height: 2.5 },
  billingCity: { left: 52, top: 83.8, width: 18, height: 2.5 },
  billingState: { left: 71, top: 83.8, width: 4, height: 2.5 },
  billingZip: { left: 76, top: 83.8, width: 8, height: 2.5 },
  billingPhone: { left: 85, top: 83.8, width: 12, height: 2.5 },
  billingNpi: { left: 52, top: 86.2, width: 20, height: 2.5 },
} as const satisfies Record<string, PercentBox>;

/** Box 21 diagnosis A–L (two columns). */
export const CMS1500_DIAGNOSIS: PercentBox[] = [
  { left: 6, top: 44.2, width: 22, height: 2.2 },
  { left: 6, top: 46.2, width: 22, height: 2.2 },
  { left: 6, top: 48.2, width: 22, height: 2.2 },
  { left: 6, top: 50.2, width: 22, height: 2.2 },
  { left: 30, top: 44.2, width: 22, height: 2.2 },
  { left: 30, top: 46.2, width: 22, height: 2.2 },
  { left: 30, top: 48.2, width: 22, height: 2.2 },
  { left: 30, top: 50.2, width: 22, height: 2.2 },
  { left: 6, top: 52.2, width: 22, height: 2.2 },
  { left: 30, top: 52.2, width: 22, height: 2.2 },
  { left: 6, top: 54.2, width: 22, height: 2.2 },
  { left: 30, top: 54.2, width: 22, height: 2.2 },
];

/** Insurance type checkboxes (box 1). */
export const CMS1500_INSURANCE_CHECKS: Record<
  string,
  { left: number; top: number }
> = {
  medicare: { left: 4.2, top: 9.2 },
  medicaid: { left: 12.5, top: 9.2 },
  tricare: { left: 20.5, top: 9.2 },
  champva: { left: 28.5, top: 9.2 },
  groupHealth: { left: 36.5, top: 9.2 },
  feca: { left: 48.5, top: 9.2 },
  other: { left: 56.5, top: 9.2 },
};

/** Box 24 — six service lines. */
export const CMS1500_SERVICE_LINE_TOPS = [56.2, 59.3, 62.4, 65.5, 68.6, 71.7];

export const CMS1500_SERVICE_COLS = {
  fromMm: { left: 5.5, width: 3.2 },
  fromDd: { left: 9, width: 3.2 },
  fromYy: { left: 12.5, width: 4 },
  toMm: { left: 17, width: 3.2 },
  toDd: { left: 20.5, width: 3.2 },
  toYy: { left: 24, width: 4 },
  pos: { left: 29, width: 4 },
  cpt: { left: 35, width: 7 },
  modifier: { left: 43, width: 5 },
  pointer: { left: 49, width: 4 },
  charges: { left: 54, width: 10 },
  units: { left: 65, width: 4 },
  npi: { left: 72, width: 14 },
} as const;
