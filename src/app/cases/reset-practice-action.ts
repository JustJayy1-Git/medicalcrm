"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isPracticeTestCaseDescription,
  isPracticeTestPatient,
} from "@/lib/practice-test-data";
import { getProfileRole } from "@/lib/auth-profile";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type ResetPracticeResult = {
  deletedPatients: number;
  deletedCases: number;
  nextCaseNumber: number;
};

/** Admin-only: remove John Doe / iPad test patients and reset case_seq_gen to 1. */
export async function resetPracticeCasesAndNumbering(): Promise<ResetPracticeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = await getProfileRole(supabase, user.id);
  if (role !== "admin") {
    redirect(
      "/cases?error=" + encodeURIComponent("Only admins can reset practice case numbers."),
    );
  }

  const admin = createAdminClient();

  const { data: patients, error: pErr } = await admin
    .from("patients")
    .select("id, first_name, last_name");

  if (pErr) throw pErr;

  const testPatientIds = new Set<string>();
  for (const p of patients ?? []) {
    if (isPracticeTestPatient(p.first_name, p.last_name)) {
      testPatientIds.add(p.id as string);
    }
  }

  const { data: cases, error: cErr } = await admin
    .from("cases")
    .select("id, patient_id, description");

  if (cErr) throw cErr;

  const orphanCaseIds: string[] = [];
  for (const c of cases ?? []) {
    const pid = c.patient_id as string | null;
    if (pid && testPatientIds.has(pid)) continue;
    if (isPracticeTestCaseDescription(c.description as string)) {
      orphanCaseIds.push(c.id as string);
    }
  }

  let deletedPatients = 0;
  if (testPatientIds.size > 0) {
    const { error: delPErr } = await admin
      .from("patients")
      .delete()
      .in("id", [...testPatientIds]);
    if (delPErr) throw delPErr;
    deletedPatients = testPatientIds.size;
  }

  let deletedCases = 0;
  if (orphanCaseIds.length > 0) {
    const { error: delCErr } = await admin.from("cases").delete().in("id", orphanCaseIds);
    if (delCErr) throw delCErr;
    deletedCases = orphanCaseIds.length;
  }

  const { error: seqErr } = await admin.rpc("reset_case_seq_gen");
  if (seqErr) {
    throw new Error(
      `Patients removed but case counter reset failed. Run supabase/PASTE_IN_SQL_RESET_PRACTICE.sql in Supabase SQL Editor. (${seqErr.message})`,
    );
  }

  revalidatePath("/cases");
  revalidatePath("/patients");
  revalidatePath("/dashboard");
  revalidatePath("/intake-packets");
  revalidatePath("/clinical");

  return {
    deletedPatients,
    deletedCases,
    nextCaseNumber: 1,
  };
}
