import { InitialEvaluationDoc } from "@/components/clinical/initial-evaluation-doc";
import {
  PaperField,
  PaperIdentStrip,
  PaperNote,
  PaperSection,
  PaperSheet,
  PaperTextarea,
} from "@/components/clinical/paper-doc";
import { SignaturePad } from "@/components/signature-pad";
import type { ClinicalDocSlug } from "@/lib/clinical/doc-slugs";

export type DocProps = {
  initial: Record<string, unknown>;
  patientName: string;
  today: string;
  dateOfInjury?: string;
  page: number;
  totalPages: number;
  ident: Array<{ label: string; value: string }>;
};

function str(initial: Record<string, unknown>, key: string): string {
  return typeof initial[key] === "string" ? (initial[key] as string) : "";
}

function SignatureRow({
  initial,
  fields,
}: {
  initial: Record<string, unknown>;
  fields: Array<{ name: string; label: string }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 px-6 pb-8 pt-5 sm:grid-cols-2">
      {fields.map((f) => (
        <SignaturePad
          key={f.name}
          name={f.name}
          label={f.label}
          initialDataUrl={str(initial, f.name) || null}
          heightPx={120}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NOFA — placeholder until the practice's state form is uploaded.    */
/* When the original document is provided, transcribe it verbatim.    */

export function NofaDoc({ initial, patientName, today, page, totalPages, ident }: DocProps) {
  return (
    <PaperSheet
      title="Florida Motor Vehicle No-Fault Law (PIP) — Notice & Authorization"
      titleEs="Ley de No Culpa de Florida — Aviso y Autorización"
      page={page}
      totalPages={totalPages}
    >
      <PaperIdentStrip fields={ident} />
      <PaperSection num={1} title="Notice to patient" titleEs="Aviso al paciente">
        <PaperNote>
          Under the Florida Motor Vehicle No-Fault Law (§627.736, Fla. Stat.),
          Personal Injury Protection (PIP) benefits cover 80% of reasonable
          medical expenses for injuries arising from a motor vehicle accident,
          provided initial services are received within 14 days of the accident.
          I understand that reimbursement is limited to $2,500 unless a licensed
          provider determines that I had an Emergency Medical Condition (EMC),
          in which case benefits of up to $10,000 may apply. I authorize
          Pro Injury Medical &amp; Rehabilitation to submit claims to my PIP
          carrier and to receive payment directly for services rendered.
        </PaperNote>
      </PaperSection>

      <PaperSection num={2} title="Patient acknowledgment" titleEs="Reconocimiento del paciente">
        <div className="grid grid-cols-2 gap-4">
          <PaperField
            label="Patient name (print)"
            name="patient_name_print"
            defaultValue={str(initial, "patient_name_print") || patientName}
          />
          <PaperField
            label="Date signed"
            name="signed_date"
            type="date"
            defaultValue={str(initial, "signed_date") || today}
          />
        </div>
        <PaperTextarea label="Notes" name="notes" rows={3} defaultValue={str(initial, "notes")} />
      </PaperSection>

      <SignatureRow
        initial={initial}
        fields={[
          { name: "patient_signature", label: "Patient signature" },
          { name: "provider_signature", label: "Provider signature" },
        ]}
      />
    </PaperSheet>
  );
}

/* ------------------------------------------------------------------ */
/* EMC — verbatim transcription of the practice's paper               */
/* "NOTICE OF EMERGENCY MEDICAL CONDITION". Do not paraphrase.        */

function SigLine({
  initial,
  nameField,
  nameLabel,
  sigField,
  sigLabel,
  dateField,
  today,
  defaultName,
}: {
  initial: Record<string, unknown>;
  nameField: string;
  nameLabel: string;
  sigField: string;
  sigLabel: string;
  dateField: string;
  today: string;
  defaultName?: string;
}) {
  return (
    <div className="grid grid-cols-[2fr_2fr_1fr] items-end gap-6">
      <label className="block">
        <input
          type="text"
          name={nameField}
          defaultValue={str(initial, nameField) || defaultName || ""}
          className="w-full border-0 border-b border-black bg-transparent px-1 py-1 text-[12px] focus:outline-none"
          style={{ boxShadow: "none" }}
        />
        <span className="mt-1 block text-[11px]">{nameLabel}</span>
      </label>
      <div>
        <SignaturePad
          name={sigField}
          label=""
          initialDataUrl={str(initial, sigField) || null}
          heightPx={80}
        />
        <span className="mt-1 block text-[11px]">{sigLabel}</span>
      </div>
      <label className="block">
        <input
          type="date"
          name={dateField}
          defaultValue={str(initial, dateField) || today}
          className="w-full border-0 border-b border-black bg-transparent px-1 py-1 text-[12px] focus:outline-none"
          style={{ boxShadow: "none" }}
        />
        <span className="mt-1 block text-[11px]">Date:</span>
      </label>
    </div>
  );
}

export function EmcDoc({
  initial,
  patientName,
  today,
  dateOfInjury,
  page,
  totalPages,
  ident,
}: DocProps) {
  return (
    <PaperSheet
      title="Notice of Emergency Medical Condition"
      page={page}
      totalPages={totalPages}
    >
      <PaperIdentStrip fields={ident} />
      <div className="space-y-4 px-8 pt-5 text-[12px] leading-relaxed">
        <h2 className="m-0 text-center text-[16px] font-extrabold uppercase underline underline-offset-4">
          Notice of Emergency Medical Condition
        </h2>

        <p className="m-0">The undersigned licensed medical provider, hereby affirms:</p>

        <ol className="m-0 list-decimal space-y-3 pl-8">
          <li>
            The below injured patient, has in the opinion of this medical provider,
            suffered an <strong>Emergency Medical Condition</strong>, as a result of
            the patient&apos;s injuries sustained an automobile accident that occurred
            on the following day{" "}
            <input
              type="date"
              name="date_of_acc"
              defaultValue={str(initial, "date_of_acc") || dateOfInjury || ""}
              className="mx-1 inline-block w-[140px] border-0 border-b border-black bg-transparent px-1 text-[12px] focus:outline-none"
              style={{ boxShadow: "none" }}
            />{" "}
            (Date of Acc).
          </li>
          <li>
            The basis for the finding of an{" "}
            <strong>Emergency Medical Condition</strong> is that the patient has
            sustained acute symptoms of sufficient severity, which may include severe
            pain, such that the absence of immediate medical attention{" "}
            <span className="underline">could</span> reasonably be expected to result
            in any of the following: a) serious jeopardy to patient health; b) serious
            impairment to bodily functions; or c) serious dysfunction of a bodily
            organ or part.
          </li>
        </ol>

        <p className="m-0">
          I hereby attest that I am a physician licensed under chapter 458 er chapter
          459, a dentist licensed under chapter 466, a physician assistant licensed
          under chapter 459 or chapter 459, or an advanced registered nurse
          practitioner licensed under chapter 464, and that the above facts are true
          and correct.
        </p>

        <SigLine
          initial={initial}
          nameField="provider_name_print"
          nameLabel="Name (Print or Type)"
          sigField="provider_signature"
          sigLabel="Signature of Medical Provider"
          dateField="provider_date"
          today={today}
        />

        <ol className="m-0 list-decimal space-y-2 pl-8">
          <li>The symptoms I reported to the medical provider are true and accurate.</li>
          <li>
            I understand the medical provider has determined I sustained an Emergency
            Medical Condition as a result of the injuries I suffered in the car
            accident.
          </li>
          <li>
            The medical provider has explained to my satisfaction the need for future
            medical attention and the harmful consequences to my health which may
            occur if I do not receive future treatment.
          </li>
        </ol>

        <p className="m-0">
          Injured patient receiving this diagnosis or legal guardian of said injured
          patient:
        </p>

        <SigLine
          initial={initial}
          nameField="patient_name_print"
          nameLabel="Name (Print or Type)"
          sigField="patient_signature"
          sigLabel="Signature of injured patient/guardian"
          dateField="patient_date"
          today={today}
          defaultName={patientName}
        />

        <div className="flex justify-end pb-8 pt-4">
          <label className="flex items-baseline gap-2 text-[12px] font-bold">
            Patient Initials:
            <input
              type="text"
              name="patient_initials"
              defaultValue={str(initial, "patient_initials")}
              className="w-[90px] border-0 border-b border-black bg-transparent px-1 text-[12px] font-normal focus:outline-none"
              style={{ boxShadow: "none" }}
            />
          </label>
        </div>
      </div>
    </PaperSheet>
  );
}

/* ------------------------------------------------------------------ */
/* Follow-up report — the only document on a follow-up visit.         */

export function FollowUpDoc({ initial, patientName, today, page, totalPages, ident }: DocProps) {
  return (
    <PaperSheet
      title="Follow-Up Report"
      titleEs="Informe de Seguimiento"
      page={page}
      totalPages={totalPages}
    >
      <PaperIdentStrip fields={ident} />
      <PaperSection num={1} title="Subjective" titleEs="Subjetivo">
        <PaperTextarea
          label="Patient-reported status since last visit"
          name="subjective"
          rows={3}
          defaultValue={str(initial, "subjective")}
        />
        <div className="grid grid-cols-2 gap-4">
          <PaperField
            label="Pain level today (0–10)"
            name="pain_level"
            type="number"
            defaultValue={str(initial, "pain_level")}
          />
          <PaperField
            label="Visit date"
            name="signed_date"
            type="date"
            defaultValue={str(initial, "signed_date") || today}
          />
        </div>
      </PaperSection>

      <PaperSection num={2} title="Objective" titleEs="Objetivo">
        <PaperTextarea
          label="Exam findings this visit"
          name="objective"
          rows={4}
          defaultValue={str(initial, "objective")}
        />
      </PaperSection>

      <PaperSection num={3} title="Assessment" titleEs="Evaluación">
        <PaperTextarea
          label="Progress relative to plan of care"
          name="assessment"
          rows={3}
          defaultValue={str(initial, "assessment")}
        />
      </PaperSection>

      <PaperSection num={4} title="Plan" titleEs="Plan">
        <PaperTextarea
          label="Continue / modify treatment, referrals, next re-evaluation"
          name="plan"
          rows={3}
          defaultValue={str(initial, "plan")}
        />
        <PaperField
          label="Patient name (print)"
          name="patient_name_print"
          defaultValue={str(initial, "patient_name_print") || patientName}
          className="max-w-sm"
        />
      </PaperSection>

      <SignatureRow
        initial={initial}
        fields={[{ name: "provider_signature", label: "Provider signature" }]}
      />
    </PaperSheet>
  );
}

export const DOC_COMPONENTS: Record<
  ClinicalDocSlug,
  (props: DocProps) => React.ReactNode
> = {
  "initial-evaluation": InitialEvaluationDoc,
  emc: EmcDoc,
  nofa: NofaDoc,
  "follow-up": FollowUpDoc,
};
