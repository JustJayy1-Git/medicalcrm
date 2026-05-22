import type { SupabaseClient } from "@supabase/supabase-js";

export function chargeLineTotal(ch: { fee: number | string; units: number | null }) {
  return Number(ch.fee) * (Number(ch.units) || 1);
}

export function paymentStatus(lineTotal: number, newPaid: number) {
  if (newPaid >= lineTotal - 0.005) return "paid" as const;
  if (newPaid > 0) return "partial" as const;
  return "billed" as const;
}

export async function applyPaymentToCharge(
  supabase: SupabaseClient,
  chargeId: string,
  caseId: string,
  amount: number,
  paidDate: string,
): Promise<{ error?: string }> {
  const { data: charge, error: fetchErr } = await supabase
    .from("charges")
    .select("id, fee, units, paid")
    .eq("id", chargeId)
    .eq("case_id", caseId)
    .maybeSingle();

  if (fetchErr || !charge) {
    return { error: fetchErr?.message ?? "Charge not found." };
  }

  const lineTotal = chargeLineTotal(charge);
  const newPaid = Number(charge.paid ?? 0) + amount;

  const { error } = await supabase
    .from("charges")
    .update({
      paid: newPaid,
      paid_date: paidDate,
      status: paymentStatus(lineTotal, newPaid),
    })
    .eq("id", chargeId);

  if (error) return { error: error.message };
  return {};
}

export const PAYMENT_REVALIDATE_PATHS = [
  "/billing",
  "/billing/payments",
  "/billing/payments/batch",
  "/reports/attorney-ledger/print",
  "/reports/ar-aging",
  "/reports/ar-aging/print",
] as const;
