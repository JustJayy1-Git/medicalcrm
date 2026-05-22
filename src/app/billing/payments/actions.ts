"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  applyPaymentToCharge,
  PAYMENT_REVALIDATE_PATHS,
} from "@/lib/payment-post";

function revalidateAfterPayment(caseId: string) {
  revalidatePath(`/cases/${caseId}`);
  for (const p of PAYMENT_REVALIDATE_PATHS) {
    revalidatePath(p);
  }
}

export async function postChargePayment(formData: FormData) {
  const chargeId = String(formData.get("charge_id") ?? "").trim();
  const caseId = String(formData.get("case_id") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const paidDate = String(formData.get("paid_date") ?? "").trim();

  const back = `/billing/payments?caseId=${encodeURIComponent(caseId)}`;

  if (!chargeId || !caseId || !paidDate || Number.isNaN(amount) || amount < 0) {
    redirect(`${back}&error=${encodeURIComponent("Invalid payment data.")}`);
  }

  const supabase = await createClient();
  const result = await applyPaymentToCharge(
    supabase,
    chargeId,
    caseId,
    amount,
    paidDate,
  );

  if (result.error) {
    redirect(`${back}&error=${encodeURIComponent(result.error)}`);
  }

  revalidateAfterPayment(caseId);
  redirect(back);
}

export type BatchPaymentEntry = { chargeId: string; amount: number };

export async function postBatchPayment(formData: FormData) {
  const caseId = String(formData.get("case_id") ?? "").trim();
  const paidDate = String(formData.get("paid_date") ?? "").trim();
  const checkRef = String(formData.get("check_ref") ?? "").trim();
  const entriesRaw = String(formData.get("entries") ?? "[]");

  const back = `/billing/payments/batch?caseId=${encodeURIComponent(caseId)}`;

  if (!caseId || !paidDate) {
    redirect(`${back}&error=${encodeURIComponent("Case and paid date are required.")}`);
  }

  let entries: BatchPaymentEntry[];
  try {
    entries = JSON.parse(entriesRaw) as BatchPaymentEntry[];
  } catch {
    redirect(`${back}&error=${encodeURIComponent("Invalid payment lines.")}`);
  }

  const valid = entries.filter(
    (e) => e.chargeId && !Number.isNaN(e.amount) && e.amount > 0,
  );

  if (valid.length === 0) {
    redirect(`${back}&error=${encodeURIComponent("Select at least one line with an amount.")}`);
  }

  const supabase = await createClient();
  let applied = 0;
  let total = 0;

  for (const { chargeId, amount } of valid) {
    const { data: row } = await supabase
      .from("charges")
      .select("balance, case_id")
      .eq("id", chargeId)
      .maybeSingle();

    if (!row || row.case_id !== caseId) {
      redirect(`${back}&error=${encodeURIComponent("Invalid charge for this case.")}`);
    }
    if (amount > Number(row.balance) + 0.005) {
      redirect(
        `${back}&error=${encodeURIComponent("Payment exceeds line balance.")}`,
      );
    }

    const result = await applyPaymentToCharge(
      supabase,
      chargeId,
      caseId,
      amount,
      paidDate,
    );
    if (result.error) {
      redirect(
        `${back}&error=${encodeURIComponent(`Line ${chargeId.slice(0, 8)}: ${result.error}`)}`,
      );
    }
    applied += 1;
    total += amount;
  }

  revalidateAfterPayment(caseId);

  const ok = new URLSearchParams({
    caseId,
    ok: `${applied}`,
    total: total.toFixed(2),
  });
  if (checkRef) ok.set("ref", checkRef);

  redirect(`/billing/payments/batch?${ok.toString()}`);
}
