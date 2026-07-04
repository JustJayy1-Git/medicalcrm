import { PaperIdentStrip, PaperSheet } from "@/components/clinical/paper-doc";
import { SignaturePad } from "@/components/signature-pad";
import { saveTherapyConsentAction } from "@/app/therapy/cases/[id]/actions";

/**
 * Verbatim transcription of the practice's paper "CONSENT FOR THERAPY"
 * (English). Signed once, on the patient's first therapy visit.
 * Do not paraphrase the wording.
 */

const CONSENT_BULLETS = [
  "The relationship between client and the massage/physical therapist is a confidential one, that all information provided to the therapist is to be kept confidential.",
  "My body will be properly draped at all times for comfort, security and warmth.",
  "The massage/physical therapy is solely for the purpose of therapeutic massage/physical and that the massage/physical therapist has the right to be free any unwanted, harmful, offensive and/or massage/physical contact or behavior.",
  "I have the right to request and require that any procedure or technique be modified, changed, stopped, or simply not performed.",
  "The information given is accurate and agrees to update the therapist of health changes at future appointments as appropriate.",
  "It may be necessary to obtain permission from my healthcare provider, to receive or continue therapy.",
  "I will inform the therapist of any discomfort, so that the application of pressure or strokes may be adjusted to my level of comfort.",
  "The benefits of massage/physical and discomfort that I may feel have been explained.",
  "The therapeutic massage/physical is ancillary treatment, not primary medical treatment.",
  "The therapist is state-licensed.",
  "By signing this form, I also give consent for future sessions.  I have read this form and hereby freely give my permission to have massage/physical therapy.",
];

function str(initial: Record<string, unknown>, key: string): string {
  return typeof initial[key] === "string" ? (initial[key] as string) : "";
}

export function ConsentForTherapyBody({
  initial,
  patientName,
  today,
  ident,
  readOnly = false,
}: {
  initial: Record<string, unknown>;
  patientName: string;
  today: string;
  ident: Array<{ label: string; value: string }>;
  readOnly?: boolean;
}) {
  const LINE_H = 56;
  // No case number on the consent — patient-facing document.
  const identFields = ident.filter((f) => f.label !== "Case #");
  return (
    <PaperSheet title="Consent for Therapy" page={1} totalPages={1}>
      <PaperIdentStrip fields={identFields} />
      <div className="space-y-4 px-8 pt-5 text-[12px] leading-relaxed">
        <h2 className="m-0 text-center text-[17px] font-extrabold uppercase underline underline-offset-4">
          Consent for Therapy
        </h2>

        <p className="m-0 flex items-baseline gap-2">
          I
          <input
            type="text"
            name="patient_name_print"
            defaultValue={str(initial, "patient_name_print") || patientName}
            className="min-w-0 flex-1 max-w-[340px] border-0 border-b border-black bg-transparent px-1 text-[12px] focus:outline-none"
            style={{ boxShadow: "none" }}
          />
          UNDERSTAND THAT:
        </p>

        <ul className="m-0 list-disc space-y-2 pl-7">
          {CONSENT_BULLETS.map((b) => (
            <li key={b.slice(0, 40)}>{b}</li>
          ))}
        </ul>

        <p className="m-0 pt-1">
          As a minor, I have been informed in presence of my guardian.
        </p>

        <div className="grid grid-cols-2 gap-10 pt-3">
          <label className="block">
            <span className="flex items-end" style={{ height: LINE_H }}>
              <input
                type="text"
                name="print_name_line"
                defaultValue={str(initial, "print_name_line") || patientName}
                className="w-full border-0 border-b border-black bg-transparent px-1 pb-1 text-[12px] focus:outline-none"
                style={{ boxShadow: "none" }}
              />
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase">Print Name</span>
          </label>
          <SignaturePad
            name="patient_signature"
            label="SIGNATURE"
            initialDataUrl={str(initial, "patient_signature") || null}
            heightPx={LINE_H}
            variant="line"
          />
        </div>

        <div className="grid grid-cols-2 gap-10 pt-2">
          <label className="block">
            <span className="flex items-end" style={{ height: LINE_H }}>
              <input
                type="date"
                name="signed_date"
                defaultValue={str(initial, "signed_date") || today}
                className="w-full border-0 border-b border-black bg-transparent px-1 pb-1 text-[12px] focus:outline-none"
                style={{ boxShadow: "none" }}
              />
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase">Date:</span>
          </label>
          <SignaturePad
            name="therapist_signature"
            label="THERAPIST SIGNATURE"
            initialDataUrl={str(initial, "therapist_signature") || null}
            heightPx={LINE_H}
            variant="line"
          />
        </div>

        <div className="grid grid-cols-2 gap-10 pb-8 pt-2">
          <span aria-hidden />
          <label className="block">
            <span className="flex items-end" style={{ height: LINE_H }}>
              <input
                type="text"
                name="therapist_name"
                defaultValue={str(initial, "therapist_name")}
                className="w-full border-0 border-b border-black bg-transparent px-1 pb-1 text-[12px] focus:outline-none"
                style={{ boxShadow: "none" }}
              />
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase">Therapist Name</span>
          </label>
        </div>

        {!readOnly ? (
          <div className="flex justify-end pb-6">
            <button
              type="submit"
              className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white shadow-sm"
            >
              Save consent
            </button>
          </div>
        ) : null}
      </div>
    </PaperSheet>
  );
}

/** Consent as a submittable form (therapist portal, first visit). */
export function ConsentForTherapyForm({
  caseId,
  patientId,
  initial,
  patientName,
  today,
  ident,
}: {
  caseId: string;
  patientId: string;
  initial: Record<string, unknown>;
  patientName: string;
  today: string;
  ident: Array<{ label: string; value: string }>;
}) {
  return (
    <form action={saveTherapyConsentAction}>
      <input type="hidden" name="case_id" value={caseId} />
      <input type="hidden" name="patient_id" value={patientId} />
      <ConsentForTherapyBody
        initial={initial}
        patientName={patientName}
        today={today}
        ident={ident}
      />
    </form>
  );
}
