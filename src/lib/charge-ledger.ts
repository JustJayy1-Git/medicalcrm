export type ChargeRow = {
  id: string;
  cpt_code: string | null;
  units: number;
  fee: number;
  paid?: number | null;
  modifier: string | null;
  icd_codes?: string[] | null;
  status?: string | null;
  line_number?: number | null;
};

export type VisitRow = {
  id: string;
  visit_date: string;
  visit_number?: number | null;
  visit_type?: string | null;
  notes?: string | null;
  charges?: ChargeRow[] | null;
};

export type LedgerVisit = VisitRow & {
  chargeTotal: number;
  paidTotal: number;
  lineCount: number;
};

export type LedgerDay = {
  visit_date: string;
  visits: LedgerVisit[];
  dayTotal: number;
};

export type CaseLedger = {
  visits: LedgerVisit[];
  days: LedgerDay[];
  totalCharges: number;
  /** Medisoft-style account total (sum of all charge lines). */
  accountTotal: number;
  totalPaid: number;
  visitCount: number;
  chargeLineCount: number;
  firstServiceDate: string | null;
  lastServiceDate: string | null;
};

export function lineAmount(c: {
  fee?: number | string | null;
  units?: number | null;
}) {
  const fee = Number(c.fee ?? 0);
  const units = Number(c.units ?? 1) || 1;
  return fee * units;
}

function groupByDate(visits: LedgerVisit[]): LedgerDay[] {
  const map = new Map<string, LedgerVisit[]>();
  for (const v of visits) {
    const list = map.get(v.visit_date) ?? [];
    list.push(v);
    map.set(v.visit_date, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([visit_date, dayVisits]) => ({
      visit_date,
      visits: dayVisits,
      dayTotal: dayVisits.reduce((s, v) => s + v.chargeTotal, 0),
    }));
}

export function buildCaseLedger(visits: VisitRow[]): CaseLedger {
  const mapped: LedgerVisit[] = (visits ?? []).map((v) => {
    const charges = v.charges ?? [];
    const chargeTotal = charges.reduce((s, c) => s + lineAmount(c), 0);
    const paidTotal = charges.reduce((s, c) => s + Number(c.paid ?? 0), 0);
    return {
      ...v,
      charges,
      chargeTotal,
      paidTotal,
      lineCount: charges.length,
    };
  });

  const days = groupByDate(mapped);
  const totalCharges = mapped.reduce((s, v) => s + v.chargeTotal, 0);
  const totalPaid = mapped.reduce((s, v) => s + v.paidTotal, 0);
  const dates = mapped.map((v) => v.visit_date).sort();

  return {
    visits: mapped,
    days,
    totalCharges,
    accountTotal: totalCharges,
    totalPaid,
    visitCount: mapped.length,
    chargeLineCount: mapped.reduce((s, v) => s + v.lineCount, 0),
    firstServiceDate: dates[0] ?? null,
    lastServiceDate: dates.at(-1) ?? null,
  };
}

export function dayTotalForDate(ledger: CaseLedger, visitDate: string) {
  return ledger.days.find((d) => d.visit_date === visitDate)?.dayTotal ?? 0;
}
