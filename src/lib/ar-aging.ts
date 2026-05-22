export const AGING_BUCKETS = ["0-30", "31-60", "61-90", "90+"] as const;
export type AgingBucket = (typeof AGING_BUCKETS)[number];

export type AgingLine = {
  chargeId: string;
  caseId: string;
  caseLabel: string;
  carrierId: string | null;
  carrierName: string;
  serviceDate: string;
  cpt_code: string | null;
  balance: number;
  daysOld: number;
  bucket: AgingBucket;
};

export type CarrierAgingRow = {
  carrierId: string | null;
  carrierName: string;
  buckets: Record<AgingBucket, number>;
  total: number;
  lineCount: number;
};

export type ArAgingReport = {
  asOfDate: string;
  carriers: CarrierAgingRow[];
  grandBuckets: Record<AgingBucket, number>;
  grandTotal: number;
  lines: AgingLine[];
};

export function emptyBuckets(): Record<AgingBucket, number> {
  return { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
}

export function agingBucket(daysOld: number): AgingBucket {
  if (daysOld <= 30) return "0-30";
  if (daysOld <= 60) return "31-60";
  if (daysOld <= 90) return "61-90";
  return "90+";
}

/** Days since service/billed date (inclusive of start day as 0). */
export function daysSince(isoDate: string, asOf = new Date()) {
  const start = new Date(isoDate + "T12:00:00").getTime();
  const end = new Date(asOf.toISOString().slice(0, 10) + "T12:00:00").getTime();
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

type ChargeInput = {
  id: string;
  balance: number;
  billed_date: string | null;
  cpt_code: string | null;
  visit_date: string | null;
  case_id: string;
  case_number: string | null;
  patient_last: string | null;
  patient_first: string | null;
  carrier_id: string | null;
  carrier_name: string | null;
};

export function buildArAgingReport(
  charges: ChargeInput[],
  asOf = new Date(),
): ArAgingReport {
  const asOfDate = asOf.toISOString().slice(0, 10);
  const lines: AgingLine[] = [];

  for (const ch of charges) {
    const balance = Number(ch.balance);
    if (balance <= 0) continue;

    const serviceDate = ch.billed_date ?? ch.visit_date;
    if (!serviceDate) continue;

    const daysOld = daysSince(serviceDate, asOf);
    const bucket = agingBucket(daysOld);
    const patient =
      ch.patient_last && ch.patient_first
        ? `${ch.patient_last}, ${ch.patient_first}`
        : "Unknown";
    const caseLabel = ch.case_number
      ? `${patient} · ${ch.case_number}`
      : `${patient} · ${ch.case_id.slice(0, 8)}`;

    lines.push({
      chargeId: ch.id,
      caseId: ch.case_id,
      caseLabel,
      carrierId: ch.carrier_id,
      carrierName: ch.carrier_name ?? "No carrier on case",
      serviceDate,
      cpt_code: ch.cpt_code,
      balance,
      daysOld,
      bucket,
    });
  }

  const carrierMap = new Map<string, CarrierAgingRow>();

  for (const line of lines) {
    const key = line.carrierId ?? "__none__";
    let row = carrierMap.get(key);
    if (!row) {
      row = {
        carrierId: line.carrierId,
        carrierName: line.carrierName,
        buckets: emptyBuckets(),
        total: 0,
        lineCount: 0,
      };
      carrierMap.set(key, row);
    }
    row.buckets[line.bucket] += line.balance;
    row.total += line.balance;
    row.lineCount += 1;
  }

  const carriers = [...carrierMap.values()].sort((a, b) =>
    a.carrierName.localeCompare(b.carrierName),
  );

  const grandBuckets = emptyBuckets();
  let grandTotal = 0;
  for (const c of carriers) {
    for (const b of AGING_BUCKETS) {
      grandBuckets[b] += c.buckets[b];
    }
    grandTotal += c.total;
  }

  lines.sort((a, b) => b.daysOld - a.daysOld);

  return { asOfDate, carriers, grandBuckets, grandTotal, lines };
}
