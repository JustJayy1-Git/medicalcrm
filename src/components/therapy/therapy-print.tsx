import type { SupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { PaperIdentStrip, PaperSheet } from "@/components/clinical/paper-doc";
import { PrintToolbar } from "@/components/print/print-toolbar";
import { ConsentForTherapyBody } from "@/components/therapy/consent-doc";
import {
  getTherapyCase,
  listTherapySessions,
  SOAP_PROCEDURE_LABELS,
  sessionProcedureLines,
} from "@/lib/therapy/therapy";

function fmtDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US");
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

/** Printable therapy record: consent signature + every therapy sheet. */
export async function TherapyPrint({
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
  let caseRow: Awaited<ReturnType<typeof getTherapyCase>> = null;
  try {
    caseRow = await getTherapyCase(supabase, caseId);
  } catch {
    notFound();
  }
  if (!caseRow) notFound();

  const patient = Array.isArray(caseRow.patient) ? caseRow.patient[0] : caseRow.patient;
  const consent = Array.isArray(caseRow.consent) ? caseRow.consent[0] : caseRow.consent;
  if (!patient) notFound();

  const sessions = await listTherapySessions(supabase, caseId);
  const patientName = `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim();
  const consentJson = (consent?.consent_json ?? {}) as Record<string, unknown>;
  const today = new Date().toLocaleDateString("en-CA");

  const ident = [
    { label: "Patient", value: patientName },
    { label: "Date of birth", value: fmtDate(patient.date_of_birth) },
    { label: "Case #", value: String(caseRow.case_number ?? "") },
    { label: "Date of injury", value: fmtDate(caseRow.date_of_injury) },
  ];

  const totalPages = 1 + (sessions.length > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#1a1d24]">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <PrintToolbar
        backHref={backHref}
        backLabel={backLabel}
        title={`${patientName} · Therapy record · ${sessions.length} sessions`}
      />

      {/* Consent page — the real document, read-only */}
      <fieldset disabled className="m-0 border-0 p-0">
        <ConsentForTherapyBody
          initial={consentJson}
          patientName={patientName}
          today={today}
          ident={ident}
          readOnly
        />
      </fieldset>

      {/* Session log */}
      {sessions.length > 0 ? (
        <PaperSheet title="Therapy Session Log" page={2} totalPages={totalPages}>
          <PaperIdentStrip fields={ident} />
          <div className="px-8 pb-10 pt-5">
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr>
                  {["Date", "Procedures (CPT)", "Pain", "Notes"].map((h) => (
                    <th
                      key={h}
                      className="border border-black/40 bg-black/5 px-2 py-1.5 text-left text-[8.5px] font-bold uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const j = (s.session_json ?? {}) as Record<string, unknown>;
                  const lines = sessionProcedureLines(j);
                  return (
                    <tr key={s.id as string}>
                      <td className="border border-black/40 px-2 py-1.5 whitespace-nowrap">
                        {fmtDate(s.session_date as string)}
                      </td>
                      <td className="border border-black/40 px-2 py-1.5">
                        {lines.length
                          ? lines
                              .map(
                                (l) =>
                                  `${SOAP_PROCEDURE_LABELS.get(l.code) ?? l.code} (${l.code}${l.units > 1 ? ` ×${l.units}` : ""})`,
                              )
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="border border-black/40 px-2 py-1.5 text-right">
                        {String(j.pain_level ?? "")}
                      </td>
                      <td className="border border-black/40 px-2 py-1.5">
                        {String(j.notes ?? "")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PaperSheet>
      ) : null}
      <div className="no-print h-8" />
    </div>
  );
}
