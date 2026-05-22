import { lineAmount, type ChargeRow } from "@/lib/charge-ledger";

export type AttorneyLedgerLine = {
  id: string;
  serviceDate: string;
  cpt_code: string | null;
  modifier: string | null;
  units: number;
  charge: number;
  payment: number;
  balance: number;
  status: string | null;
};

export type AttorneyLedgerSection = {
  carrierId: string | null;
  carrierName: string;
  lines: AttorneyLedgerLine[];
  totalCharges: number;
  totalPayments: number;
  balance: number;
};

export type AttorneyCaseLedger = {
  caseId: string;
  caseNumber: string | null;
  patientName: string;
  attorneyName: string | null;
  dateOfInjury: string | null;
  sections: AttorneyLedgerSection[];
  totalCharges: number;
  totalPayments: number;
  balance: number;
};

type VisitInput = {
  visit_date: string;
  charges?: (ChargeRow & { paid?: number | null })[] | null;
};

export function buildAttorneyLedger(input: {
  caseId: string;
  caseNumber: string | null;
  patientName: string;
  attorneyName: string | null;
  dateOfInjury: string | null;
  carrierId: string | null;
  carrierName: string;
  visits: VisitInput[];
}): AttorneyCaseLedger {
  const lines: AttorneyLedgerLine[] = [];

  for (const v of input.visits ?? []) {
    for (const ch of v.charges ?? []) {
      const charge = lineAmount(ch);
      const payment = Number(ch.paid ?? 0);
      lines.push({
        id: ch.id,
        serviceDate: v.visit_date,
        cpt_code: ch.cpt_code,
        modifier: ch.modifier,
        units: ch.units,
        charge,
        payment,
        balance: charge - payment,
        status: ch.status ?? null,
      });
    }
  }

  lines.sort((a, b) => {
    const d = a.serviceDate.localeCompare(b.serviceDate);
    if (d !== 0) return d;
    return (a.cpt_code ?? "").localeCompare(b.cpt_code ?? "");
  });

  const totalCharges = lines.reduce((s, l) => s + l.charge, 0);
  const totalPayments = lines.reduce((s, l) => s + l.payment, 0);

  const section: AttorneyLedgerSection = {
    carrierId: input.carrierId,
    carrierName: input.carrierName,
    lines,
    totalCharges,
    totalPayments,
    balance: totalCharges - totalPayments,
  };

  return {
    caseId: input.caseId,
    caseNumber: input.caseNumber,
    patientName: input.patientName,
    attorneyName: input.attorneyName,
    dateOfInjury: input.dateOfInjury,
    sections: [section],
    totalCharges,
    totalPayments,
    balance: totalCharges - totalPayments,
  };
}
