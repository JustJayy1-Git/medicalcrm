import Link from "next/link";
import { notFound } from "next/navigation";
import { ClinicalDocumentForm } from "@/components/clinical/clinical-document-form";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/clinical"
        className="text-sm text-[#41B6E6] hover:text-white mb-4 inline-block"
      >
        ← Back to queue
      </Link>

      <header className="mb-8 rounded-xl border border-[#2a2f3a] bg-[#121820] px-6 py-5">
        <h1 className="text-2xl font-serif font-semibold text-white">{patientName}</h1>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Case #</dt>
            <dd className="text-white font-medium">{caseRow?.case_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Date of birth</dt>
            <dd className="text-white">{fmtDate(patient?.date_of_birth)}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Date of injury</dt>
            <dd className="text-white">{fmtDate(caseRow?.date_of_injury)}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Phone</dt>
            <dd className="text-white">{patient?.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Email</dt>
            <dd className="text-white">{patient?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Status</dt>
            <dd className="text-white capitalize">{consultation.status as string}</dd>
          </div>
        </dl>
        {caseRow?.description ? (
          <p className="mt-4 text-sm text-[#c8d2e0]/80 border-t border-[#2a2f3a] pt-4">
            {caseRow.description}
          </p>
        ) : null}
      </header>

      <div className="space-y-8">
        <ClinicalDocumentForm
          caseId={caseId}
          section="nofa"
          title="NOFA"
          subtitle="Notice of financial authorization — patient signature and date. Full PDF template upload coming next."
          fields={[
            { name: "patient_name_print", label: "Patient name (print)" },
            { name: "signed_date", label: "Date signed", type: "date" },
            { name: "notes", label: "Notes", type: "textarea" },
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
          ]}
          initial={report}
          completedAt={consultation.initial_report_completed_at as string | null}
        />
      </div>
    </div>
  );
}
