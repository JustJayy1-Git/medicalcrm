import type { SupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { PaperIdentStrip, PaperSheet } from "@/components/clinical/paper-doc";
import { PrintToolbar } from "@/components/print/print-toolbar";
import {
  getTherapyCase,
  listTherapySessions,
  THERAPY_SERVICES,
} from "@/lib/therapy/therapy";

function fmtDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US");
}

const SERVICE_LABELS = new Map<string, string>(
  THERAPY_SERVICES.map((s) => [s.code, s.label]),
);

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
  const consentSig =
    typeof consentJson.patient_signature === "string"
      ? (consentJson.patient_signature as string)
      : null;

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

      {/* Consent page */}
      <PaperSheet title="Consent for Therapy" page={1} totalPages={totalPages}>
        <PaperIdentStrip fields={ident} />
        <div className="space-y-4 px-8 pb-10 pt-5 text-[12px]">
          <p className="m-0">
            Patient acknowledgment and consent to therapy services at Pro Injury
            Medical &amp; Rehabilitation.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <p className="m-0">
              <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-black/60">
                Patient name (print)
              </span>
              <span className="block border-b border-black pb-1">
                {String(consentJson.patient_name_print ?? patientName)}
              </span>
            </p>
            <p className="m-0">
              <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-black/60">
                Date signed
              </span>
              <span className="block border-b border-black pb-1">
                {consent?.signed_at
                  ? new Date(consent.signed_at as string).toLocaleDateString("en-US")
                  : String(consentJson.signed_date ?? "")}
              </span>
            </p>
          </div>
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-black/60">
              Patient signature
            </span>
            {consentSig ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={consentSig} alt="Patient signature" className="h-[110px] border-b border-black" />
            ) : (
              <span className="block h-[110px] border-b border-black" />
            )}
          </div>
        </div>
      </PaperSheet>

      {/* Session log */}
      {sessions.length > 0 ? (
        <PaperSheet title="Therapy Session Log" page={2} totalPages={totalPages}>
          <PaperIdentStrip fields={ident} />
          <div className="px-8 pb-10 pt-5">
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr>
                  {["Date", "Services (CPT)", "Body areas", "Min", "Pain", "Notes"].map((h) => (
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
                  const codes = Array.isArray(j.services) ? (j.services as string[]) : [];
                  return (
                    <tr key={s.id as string}>
                      <td className="border border-black/40 px-2 py-1.5 whitespace-nowrap">
                        {fmtDate(s.session_date as string)}
                      </td>
                      <td className="border border-black/40 px-2 py-1.5">
                        {codes.length
                          ? codes
                              .map((c) => `${SERVICE_LABELS.get(c) ?? c} (${c})`)
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="border border-black/40 px-2 py-1.5">
                        {String(j.body_areas ?? "")}
                      </td>
                      <td className="border border-black/40 px-2 py-1.5 text-right">
                        {String(j.duration_minutes ?? "")}
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
