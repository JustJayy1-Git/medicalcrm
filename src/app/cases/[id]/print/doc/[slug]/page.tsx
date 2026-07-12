import { notFound } from "next/navigation";
import { DOC_COMPONENTS } from "@/components/clinical/docs";
import { ConsentForTherapyBody } from "@/components/therapy/consent-doc";
import { TherapySoapNoteForm } from "@/components/therapy/soap-note-doc";
import { PAPER_PRINT_CSS } from "@/components/print/print-css";
import { PrintToolbar } from "@/components/print/print-toolbar";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import {
  DOC_META,
  SECTION_JSON_KEY,
  type ClinicalDocSlug,
} from "@/lib/clinical/doc-slugs";
import { getTherapyCase, listTherapySessions } from "@/lib/therapy/therapy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DOC_TITLES: Record<string, string> = {
  nofa: "Florida No-Fault (NOFA)",
  emc: "Notice of Emergency Medical Condition",
  "initial-evaluation": "Initial Evaluation",
  "follow-up": "Follow-Up Report",
  "therapy-consent": "Consent for Therapy",
  "therapy-sessions": "Therapy SOAP Notes",
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US");
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** Print a single labeled patient document (consents) or record set. */
export default async function CaseDocPrintPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id: caseId, slug } = await params;
  if (!(slug in DOC_TITLES)) notFound();

  const supabase = await createClient();
  const today = new Date().toLocaleDateString("en-CA");

  let body: React.ReactNode = null;
  let patientName = "Patient";
  let patientId: string | null = null;

  if (slug === "therapy-consent" || slug === "therapy-sessions") {
    const caseRow = await getTherapyCase(supabase, caseId).catch(() => null);
    if (!caseRow) notFound();
    const patient = one(caseRow.patient);
    const consent = one(caseRow.consent);
    if (!patient) notFound();
    patientName = `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim();
    patientId = patient.id as string;

    const ident = [
      { label: "Patient", value: patientName },
      { label: "Date of birth", value: fmtDate(patient.date_of_birth) },
      { label: "Case #", value: String(caseRow.case_number ?? "") },
      { label: "Date of injury", value: fmtDate(caseRow.date_of_injury) },
    ];

    if (slug === "therapy-consent") {
      body = (
        <ConsentForTherapyBody
          initial={(consent?.consent_json ?? {}) as Record<string, unknown>}
          patientName={patientName}
          today={today}
          ident={ident}
          readOnly
        />
      );
    } else {
      const sessions = await listTherapySessions(supabase, caseId);
      body = (
        <>
          {sessions.length === 0 ? (
            <p className="mx-auto w-[816px] max-w-full py-10 text-center text-sm text-[#c8d2e0]/70">
              No therapy sheets on file yet.
            </p>
          ) : null}
          {[...sessions].reverse().map((s) => (
            <TherapySoapNoteForm
              key={s.id as string}
              patientName={patientName}
              today={today}
              initial={(s.session_json ?? {}) as Record<string, unknown>}
              sessionDate={s.session_date as string}
              readOnly
            />
          ))}
        </>
      );
    }
  } else {
    const consultation = await getClinicalConsultation(supabase, caseId).catch(
      () => null,
    );
    if (!consultation) notFound();
    const patient = one(consultation.patient);
    const caseRow = one(consultation.case);
    patientName = patient
      ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
      : "Patient";
    patientId = (patient?.id as string) ?? null;

    const record = consultation as unknown as Record<string, unknown>;
    const docSlug = slug as ClinicalDocSlug;
    const meta = DOC_META[docSlug];
    const Doc = DOC_COMPONENTS[docSlug];
    const initial =
      (record[SECTION_JSON_KEY[meta.section]] as Record<string, unknown>) ?? {};

    body = (
      <Doc
        initial={initial}
        patientName={patientName}
        today={today}
        dateOfInjury={(caseRow?.date_of_injury as string | null) ?? undefined}
        page={1}
        totalPages={1}
        ident={[
          { label: "Patient", value: patientName },
          { label: "Date of birth", value: fmtDate(patient?.date_of_birth) },
          { label: "Case #", value: String(caseRow?.case_number ?? "") },
          { label: "Date of injury", value: fmtDate(caseRow?.date_of_injury) },
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d24]">
      <style dangerouslySetInnerHTML={{ __html: PAPER_PRINT_CSS }} />
      <PrintToolbar
        backHref={patientId ? `/patients/${patientId}?tab=files` : "/patients"}
        backLabel="Back to patient"
        title={`${patientName} · ${DOC_TITLES[slug]}`}
      />
      <fieldset disabled className="m-0 border-0 p-0">
        {body}
      </fieldset>
      <div className="no-print h-8" />
    </div>
  );
}
