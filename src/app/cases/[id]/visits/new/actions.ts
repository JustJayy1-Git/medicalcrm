"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parseCharges(formData: FormData) {
  const lines: {
    cpt_code: string;
    units: number;
    fee: number;
    modifier: string | null;
    icd_codes: string[];
  }[] = [];
  const count = Number(formData.get("line_count") ?? 0);
  for (let i = 0; i < count; i++) {
    const cpt = formData.get(`line_${i}_cpt`);
    if (typeof cpt !== "string" || !cpt.trim()) continue;
    const units = Number(formData.get(`line_${i}_units`) ?? 1) || 1;
    const fee = Number(formData.get(`line_${i}_fee`) ?? 0) || 0;
    const modifier = formData.get(`line_${i}_modifier`);
    const icdRaw = formData.get(`line_${i}_icd`);
    const icd_codes =
      typeof icdRaw === "string" && icdRaw.trim()
        ? icdRaw.split(",").map((s) => s.trim().toUpperCase())
        : [];
    lines.push({
      cpt_code: cpt.trim(),
      units,
      fee,
      modifier: typeof modifier === "string" && modifier.trim() ? modifier.trim() : null,
      icd_codes,
    });
  }
  return lines;
}

export async function saveVisit(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseId = formData.get("case_id");
  const visitDate = formData.get("visit_date");
  const providerId = formData.get("provider_id");
  const patientId = formData.get("patient_id");

  if (
    typeof caseId !== "string" ||
    typeof visitDate !== "string" ||
    typeof patientId !== "string"
  ) {
    redirect("/cases");
  }

  const charges = parseCharges(formData);
  if (charges.length === 0) {
    redirect(`/cases/${caseId}/visits/new?error=no_charges`);
  }
  if (charges.length > 6) {
    redirect(`/cases/${caseId}/visits/new?error=max_six_lines`);
  }

  const { data: existing } = await supabase
    .from("visits")
    .select("id")
    .eq("case_id", caseId)
    .eq("visit_date", visitDate)
    .limit(1)
    .maybeSingle();

  let visitId = existing?.id;

  if (visitId) {
    const { count } = await supabase
      .from("charges")
      .select("id", { count: "exact", head: true })
      .eq("visit_id", visitId);
    const existingLines = count ?? 0;
    if (existingLines + charges.length > 6) {
      redirect(`/cases/${caseId}/visits/new?error=max_six_lines`);
    }
  }

  if (!visitId) {
    const insert: Record<string, unknown> = {
      case_id: caseId,
      patient_id: patientId,
      visit_date: visitDate,
      status: "completed",
      created_by: user.id,
    };
    if (typeof providerId === "string" && providerId) {
      insert.provider_id = providerId;
    }
    const { data: created, error } = await supabase
      .from("visits")
      .insert(insert)
      .select("id")
      .single();
    if (error) {
      redirect(
        `/cases/${caseId}/visits/new?error=${encodeURIComponent(error.message)}`,
      );
    }
    visitId = created.id;
  } else if (typeof providerId === "string" && providerId) {
    await supabase
      .from("visits")
      .update({ provider_id: providerId })
      .eq("id", visitId);
  }

  const rows = charges.map((ch) => ({
    visit_id: visitId,
    case_id: caseId,
    patient_id: patientId,
    cpt_code: ch.cpt_code,
    units: ch.units,
    fee: ch.fee,
    modifier: ch.modifier,
    icd_codes: ch.icd_codes,
    status: "unbilled",
    created_by: user.id,
  }));

  const { error: chargeErr } = await supabase.from("charges").insert(rows);
  if (chargeErr) {
    redirect(
      `/cases/${caseId}/visits/new?error=${encodeURIComponent(chargeErr.message)}`,
    );
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/reports/cms-1500");
  redirect(`/cases/${caseId}?saved=1`);
}
