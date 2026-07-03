import Link from "next/link";
import { notFound } from "next/navigation";
import { ClinicalDocumentForm } from "@/components/clinical/clinical-document-form";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";
import { completeFollowUpAction } from "./actions";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US");
}

export default async function ClinicalCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;
  const supabase = await createClient();

  let consultation: Awaited<ReturnType<typeof getClinicalConsultation>> = null;
  try {
    consultation = await getClinicalConsultation(supabase, caseId);
  } catch {
    notFound();
  }

  if (!consultation) notFound();

  const patient = Array.isArray(consultation.patient)
    ? consultation.patient[0]
    : consultation.patient;
  const caseRow = Array.isArray(consultation.case)
    ? consultation.case[0]
    : consultation.case;

  const patientName = patient
    ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
    : "Patient";

  const nofa = (consultation.nofa_json ?? {}) as Record<string, unknown>;
  const emc = (consultation.emc_json ?? {}) as Record<string, unknown>;
  const report = (consultation.initial_report_json ?? {}) as Record<string, unknown>;
  const isFollowUp =
    (consultation as { visit_kind?: string }).visit_kind === "follow_up";
  const isOpen = (consultation.status as string) !== "completed";

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <Link
        href="/clinical"
        className="text-sm text-neon-pink hover:text-eggplant-800 font-medium mb-4 inline-block"
      >
        ← Back to queue
      </Link>

      <header className="lux-card mb-6 rounded-xl border border-vice-border bg-white px-6 py-5 shadow-sm">
        <h1 className="text-2xl font-serif font-semibold text-eggplant-900">
          {patientName}
        </h1>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Case #</dt>
            <dd className="text-eggplant-900 font-medium">{caseRow?.case_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Date of birth</dt>
            <dd className="text-eggplant-900">{fmtDate(patient?.date_of_birth)}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Date of injury</dt>
            <dd className="text-eggplant-900">{fmtDate(caseRow?.date_of_injury)}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Phone</dt>
            <dd className="text-eggplant-900">{patient?.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Email</dt>
            <dd className="text-eggplant-900">{patient?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Status</dt>
            <dd className="text-eggplant-900 capitalize">
              {(consultation.status as string).replace("_", " ")}
              {isFollowUp ? " · follow-up" : ""}
            </dd>
          </div>
        </dl>
        {caseRow?.description ? (
          <p className="mt-4 text-sm text-eggplant-700 border-t border-vice-border pt-4">
            {caseRow.description}
          </p>
        ) : null}
      </header>

      {isFollowUp && isOpen ? (
        <div className="mb-6 rounded-xl border border-gold/40 bg-gold-soft px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-eggplant-900">
              Follow-up visit
            </p>
            <p className="text-xs text-eggplant-700 mt-0.5">
              This patient was sent back for re-evaluation. Update any forms below,
              then mark the follow-up complete.
            </p>
          </div>
          <form action={completeFollowUpAction}>
            <input type="hidden" name="case_id" value={caseId} />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-eggplant-900 text-sm font-bold text-white hover:bg-eggplant-800"
            >
              Mark follow-up complete
            </button>
          </form>
        </div>
      ) : null}

      <div className="space-y-8">
        <ClinicalDocumentForm
          caseId={caseId}
          section="nofa"
          title="Florida No-Fault (NOFA)"
          subtitle="Patient and provider sign. Full PDF template upload coming next."
          fields={[
            { name: "patient_name_print", label: "Patient name (print)" },
            { name: "signed_date", label: "Date signed", type: "date" },
            { name: "notes", label: "Notes", type: "textarea" },
            { name: "patient_signature", label: "Patient signature", type: "signature" },
            { name: "provider_signature", label: "Provider signature", type: "signature" },
          ]}
          initial={nofa}
          completedAt={consultation.nofa_completed_at as string | null}
        />

        <ClinicalDocumentForm
          caseId={caseId}
          section="emc"
          title="Emergency Medical Condition (EMC)"
          subtitle="Document EMC findings and patient acknowledgment."
          fields={[
            { name: "emc_determination", label: "EMC determination", type: "textarea" },
            { name: "patient_name_print", label: "Patient name (print)" },
            { name: "signed_date", label: "Date signed", type: "date" },
            { name: "provider_signature", label: "Provider signature", type: "signature" },
          ]}
          initial={emc}
          completedAt={consultation.emc_completed_at as string | null}
        />

        <ClinicalDocumentForm
          caseId={caseId}
          section="initial_report"
          title="Initial report"
          subtitle="Examination, diagnosis, and plan — synced to the case chart for admin."
          fields={[
            { name: "chief_complaint", label: "Chief complaint", type: "textarea" },
            { name: "history", label: "History / HPI", type: "textarea" },
            { name: "exam_findings", label: "Exam findings", type: "textarea" },
            { name: "diagnosis", label: "Diagnosis", type: "textarea" },
            { name: "plan", label: "Plan", type: "textarea" },
            { name: "patient_name_print", label: "Patient name (print)" },
            { name: "signed_date", label: "Date signed", type: "date" },
            { name: "provider_signature", label: "Provider signature", type: "signature" },
          ]}
          initial={report}
          completedAt={consultation.initial_report_completed_at as string | null}
        />
      </div>
    </div>
  );
}
