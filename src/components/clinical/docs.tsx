import { InitialEvaluationDoc } from "@/components/clinical/initial-evaluation-doc";
import {
  PaperField,
  PaperIdentStrip,
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
/* NOFA — verbatim transcription of the Florida OIR "Standard         */
/* Disclosure and Acknowledgement Form" (PIP). Do not paraphrase.     */

const NOFA_SERVICES: Array<[string, string]> = [
  ["nofa_initial_office_visit", "Initial Office Visit"],
  ["nofa_initial_therapist_eval", "Initial Therapist Evaluation"],
  ["nofa_cold_hot_pack", "Cold/Hot Pack"],
  ["nofa_ultrasound", "Ultrasound"],
  ["nofa_xrays", "X-Rays"],
  ["nofa_electric_stimulation", "Electric Stimulation"],
  ["nofa_massage", "Massage"],
  ["nofa_therapeutic_exercises", "Therapeutic Exercises"],
  ["nofa_paraffin", "Paraffin"],
  ["nofa_infrared", "Infrared"],
];

function nofaChecked(initial: Record<string, unknown>, key: string): boolean {
  return initial[key] === "1" || initial[key] === true;
}

export function NofaDoc({ initial, patientName, today, page, totalPages, ident }: DocProps) {
  return (
    <PaperSheet
      title="Standard Disclosure and Acknowledgement Form"
      titleEs="Personal Injury Protection — Initial Treatment or Service Provided"
      page={page}
      totalPages={totalPages}
    >
      <PaperIdentStrip fields={ident} />
      <div className="space-y-3 px-8 pt-5 text-[11.5px] leading-relaxed">
        <div className="flex items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/florida-state-seal.png"
            alt="State of Florida seal"
            className="h-[62px] w-[62px] shrink-0"
          />
          <div className="text-center">
            <p className="m-0 text-[13px] font-bold uppercase underline underline-offset-2">
              Office of Insurance Regulation
            </p>
            <p className="m-0 text-[12.5px] font-semibold">
              Bureau of Property &amp; Casualty Forms and Rates
            </p>
            <p className="m-0 text-[12px]">Standard Disclosure and Acknowledgement Form</p>
            <p className="m-0 text-[12px]">
              Personal Injury Protection - Initial Treatment or Service Provided
            </p>
          </div>
        </div>

        <p className="m-0">
          The undersigned insured person (or guardian of such person) affirms:
        </p>

        <p className="m-0">
          1. The services set forth below were actually rendered. This means that
          those services have already been <strong>provided at PRO INJURY, LLC</strong>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-semibold">
          {NOFA_SERVICES.map(([name, label]) => (
            <label key={name} className="flex cursor-pointer items-center gap-1.5 text-[11.5px]">
              <input
                type="checkbox"
                name={name}
                value="1"
                defaultChecked={nofaChecked(initial, name)}
                className="h-[14px] w-[14px] accent-black"
              />
              {label}
            </label>
          ))}
          <label className="flex min-w-[280px] flex-1 items-baseline gap-1.5 text-[11.5px]">
            <input
              type="checkbox"
              name="nofa_other_check"
              value="1"
              defaultChecked={nofaChecked(initial, "nofa_other_check")}
              className="h-[14px] w-[14px] shrink-0 translate-y-0.5 accent-black"
            />
            Other:
            <input
              type="text"
              name="nofa_other_text"
              defaultValue={str(initial, "nofa_other_text")}
              className="min-w-0 flex-1 border-0 border-b border-black bg-transparent px-1 text-[11.5px] font-normal focus:outline-none"
              style={{ boxShadow: "none" }}
            />
          </label>
        </div>

        <p className="m-0">
          2. I have a right and the <strong>duty to confirm</strong> that the services
          have already been provided.
        </p>
        <p className="m-0">
          3. I was <strong>not solicited</strong> by any person to seek any services
          from the medical provider of the services described above. This means that
          no person has initiated contact with me and/or persuaded me to use the
          doctor or licensed professional, clinic, or medical institution that
          provided the services.
        </p>
        <p className="m-0">
          4. The medical provider has <strong>explained</strong> the services to me
          for which payment is being claimed.
        </p>
        <p className="m-0">
          5. If I notify the insurer in writing of a billing error, I may be entitled
          to a portion of any reduction in the amounts paid by my motor vehicle
          insurer. If entitled, my share would be at least 20% of the amount of the
          reduction, up to $500.
        </p>

        <p className="m-0">
          The undersigned licensed medical professional affirms the statement numbered
          1 above and also:
        </p>
        <div className="space-y-2 pl-6">
          <p className="m-0">
            A. I have <strong>not solicited</strong> or caused the insured person, who
            was involved in a motor vehicle accident, to be solicited to make a claim
            for Personal Injury Protection benefits.
          </p>
          <p className="m-0">
            B. I have <strong>explained</strong> the services rendered to the insured
            person, or his or her guardian, <strong>sufficiently</strong> for that
            person to sign this form with informed consent.
          </p>
          <p className="m-0">
            C. The accompanying statement or bill is properly completed in all
            material provisions and all relevant information has been provided
            therein, This means that each request for information has been responded
            to <strong>truthfully, accurately,</strong> and in a{" "}
            <strong>substantially complete manner.</strong>
          </p>
          <p className="m-0">
            D. The coding of procedures on the accompanying statement or bill is
            proper. This means that <strong>no service has been upcoded, unbundled</strong>,
            or constitutes an invalid or{" "}
            <strong>not medically necessary diagnostic test</strong> as defined by
            Section 627.732 (15) and (16), Florida Statutes or Section
            627.736(5)(b)6, Florida Statutes.
          </p>
        </div>

        <p className="m-0">
          Insured Person (patient receiving treatment) or Guardian of Insured Person:
        </p>
        <SigLine
          initial={initial}
          nameField="patient_name_print"
          nameLabel="Name (PRINT or TYPE)"
          sigField="patient_signature"
          sigLabel="Signature"
          dateField="patient_date"
          today={today}
          defaultName={patientName}
        />

        <p className="m-0">
          Licensed Medical Professional Rendering Treatment (Signature by his or her
          own hand):
        </p>
        <SigLine
          initial={initial}
          nameField="provider_name_print"
          nameLabel="Name (PRINT or TYPE)"
          sigField="provider_signature"
          sigLabel="Signature"
          dateField="provider_date"
          today={today}
        />

        <div className="space-y-2 pb-8 pt-2">
          <p className="m-0 font-bold">
            Any person who knowingly and with intent to injure, defraud, or deceive
            any insurer files a statement of Claim or an application containing any
            false, incomplete, or misleading information is guilty of a felony of the
            third degree per Section 817.234 1 , Florida Statutes.
          </p>
          <p className="m-0 font-bold">
            Note: The original of this form must be furnished to the insurer pursuant
            to Section 627.736(4)(b), Florida Statutes and may not be electronically
            furnished. Failure to furnish this form may result in non-payment of the
            claim.
          </p>
        </div>
      </div>
    </PaperSheet>
  );
}

/* ------------------------------------------------------------------ */
/* EMC — verbatim transcription of the practice's paper               */
/* "NOTICE OF EMERGENCY MEDICAL CONDITION". Do not paraphrase.        */

/**
 * Paper signature row — name / signature / date share one ruled baseline,
 * with their captions printed beneath, exactly like the paper documents.
 */
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
  const LINE_H = 64;
  return (
    <div className="grid grid-cols-[2fr_2fr_1fr] gap-8 pt-4">
      <label className="block">
        <span className="flex items-end" style={{ height: LINE_H }}>
          <input
            type="text"
            name={nameField}
            defaultValue={str(initial, nameField) || defaultName || ""}
            className="w-full border-0 border-b border-black bg-transparent px-1 pb-1 text-[12px] focus:outline-none"
            style={{ boxShadow: "none" }}
          />
        </span>
        <span className="mt-1 block text-[11px]">{nameLabel}</span>
      </label>
      <SignaturePad
        name={sigField}
        label={sigLabel}
        initialDataUrl={str(initial, sigField) || null}
        heightPx={LINE_H}
        variant="line"
      />
      <label className="block">
        <span className="flex items-end" style={{ height: LINE_H }}>
          <input
            type="date"
            name={dateField}
            defaultValue={str(initial, dateField) || today}
            className="w-full border-0 border-b border-black bg-transparent px-1 pb-1 text-[12px] focus:outline-none"
            style={{ boxShadow: "none" }}
          />
        </span>
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
          I hereby attest that I am a physician licensed under chapter 458 or chapter
          459, a dentist licensed under chapter 466, a physician assistant licensed
          under chapter 458 or chapter 459, or an advanced registered nurse
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

        <div className="pb-8" />
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
