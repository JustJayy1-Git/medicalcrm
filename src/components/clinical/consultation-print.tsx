import type { SupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { DOC_COMPONENTS } from "@/components/clinical/docs";
import { PrintToolbar } from "@/components/print/print-toolbar";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import {
  DOC_META,
  FOLLOWUP_PACKET,
  INITIAL_PACKET,
  SECTION_COMPLETED_KEY,
  SECTION_JSON_KEY,
  type ClinicalDocSlug,
} from "@/lib/clinical/doc-slugs";

function fmtDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US");
}

const PRINT_CSS = `
  @media print {
    .no-print { display: none !important; }
    body { background: #fff !important; }
    .paper-sheet {
      box-shadow: none !important;
      margin: 0 auto !important;
      min-height: auto !important;
      page-break-after: always;
    }
  }
`;

/**
 * Printable NP consultation packet — all documents stacked, page-break per
 * sheet. Read-only view of the same paper components the NP filled in.
 */
export async function ConsultationPrint({
  supabase,
  caseId,
  backHref,
  backLabel,
}: {
  supabase: SupabaseClient;
  caseId: string;
  backHref: string;
  backLabel: string;
}) {
  let consultation: Awaited<ReturnType<typeof getClinicalConsultation>> = null;
  try {
    consultation = await getClinicalConsultation(supabase, caseId);
  } catch {
    notFound();
  }
  if (!consultation) notFound();

  const record = consultation as unknown as Record<string, unknown>;
  const patient = Array.isArray(consultation.patient)
    ? consultation.patient[0]
    : consultation.patient;
  const caseRow = Array.isArray(consultation.case)
    ? consultation.case[0]
    : consultation.case;

  const patientName = patient
    ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
    : "Patient";
  const today = new Date().toLocaleDateString("en-CA");

  const ident = [
    { label: "Patient", value: patientName },
    { label: "Date of birth", value: fmtDate(patient?.date_of_birth) },
    { label: "Case #", value: String(caseRow?.case_number ?? "") },
    { label: "Date of injury", value: fmtDate(caseRow?.date_of_injury) },
  ];

  // Print every document that has any saved data; always include the
  // initial packet docs, and the follow-up note only when it was started.
  const followUpStarted =
    Boolean(record[SECTION_COMPLETED_KEY.follow_up]) ||
    Object.keys((record[SECTION_JSON_KEY.follow_up] as object) ?? {}).length > 0;

  const slugs: ClinicalDocSlug[] = [
    ...INITIAL_PACKET,
    ...(followUpStarted ? FOLLOWUP_PACKET : []),
  ];

  return (
    <div className="min-h-screen bg-[#1a1d24]">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <PrintToolbar
        backHref={backHref}
        backLabel={backLabel}
        title={`${patientName} · Consultation packet · ${slugs.length} documents`}
      />
      <fieldset disabled className="m-0 border-0 p-0">
        {slugs.map((slug, idx) => {
          const meta = DOC_META[slug];
          const Doc = DOC_COMPONENTS[slug];
          const initial =
            (record[SECTION_JSON_KEY[meta.section]] as Record<string, unknown>) ?? {};
          return (
            <Doc
              key={slug}
              initial={initial}
              patientName={patientName}
              today={today}
              dateOfInjury={(caseRow?.date_of_injury as string | null) ?? undefined}
              page={idx + 1}
              totalPages={slugs.length}
              ident={ident}
            />
          );
        })}
      </fieldset>
      <div className="no-print h-8" />
    </div>
  );
}
