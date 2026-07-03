import {
  PaperCheckGroup,
  PaperField,
  PaperNote,
  PaperSection,
  PaperTextarea,
} from "@/components/clinical/paper-doc";
import { SignaturePad } from "@/components/signature-pad";
import type { ClinicalDocSlug } from "@/lib/clinical/doc-slugs";

type DocProps = {
  initial: Record<string, unknown>;
  patientName: string;
  today: string;
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

export function NofaDoc({ initial, patientName, today }: DocProps) {
  return (
    <>
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
        <PaperTextarea
          label="Notes"
          name="notes"
          rows={3}
          defaultValue={str(initial, "notes")}
        />
      </PaperSection>

      <PaperSection num={3} title="Signatures" titleEs="Firmas">
        <p className="m-0 text-[10px] text-black/60">
          Patient signs to acknowledge the notice; provider countersigns.
        </p>
      </PaperSection>
      <SignatureRow
        initial={initial}
        fields={[
          { name: "patient_signature", label: "Patient signature" },
          { name: "provider_signature", label: "Provider signature" },
        ]}
      />
    </>
  );
}

export function EmcDoc({ initial, patientName, today }: DocProps) {
  return (
    <>
      <PaperSection num={1} title="Determination" titleEs="Determinación">
        <PaperCheckGroup
          legend="In my professional opinion, this patient has an Emergency Medical Condition as defined by §627.732(16), Fla. Stat."
          name="emc_present"
          defaultValue={str(initial, "emc_present")}
          options={[
            { value: "yes", label: "YES — EMC determined (up to $10,000 PIP)" },
            { value: "no", label: "NO — no EMC (limited to $2,500 PIP)" },
          ]}
        />
      </PaperSection>

      <PaperSection num={2} title="Clinical basis" titleEs="Base clínica">
        <PaperTextarea
          label="Findings and rationale for determination"
          name="emc_determination"
          rows={7}
          defaultValue={str(initial, "emc_determination")}
        />
      </PaperSection>

      <PaperSection num={3} title="Patient & date" titleEs="Paciente y fecha">
        <div className="grid grid-cols-2 gap-4">
          <PaperField
            label="Patient name (print)"
            name="patient_name_print"
            defaultValue={str(initial, "patient_name_print") || patientName}
          />
          <PaperField
            label="Date"
            name="signed_date"
            type="date"
            defaultValue={str(initial, "signed_date") || today}
          />
        </div>
      </PaperSection>

      <SignatureRow
        initial={initial}
        fields={[{ name: "provider_signature", label: "Provider signature" }]}
      />
    </>
  );
}

export function InitialReportDoc({ initial, patientName, today }: DocProps) {
  return (
    <>
      <PaperSection num={1} title="Chief complaint" titleEs="Motivo de consulta">
        <PaperTextarea
          label="Patient's primary complaint(s)"
          name="chief_complaint"
          rows={3}
          defaultValue={str(initial, "chief_complaint")}
        />
      </PaperSection>

      <PaperSection num={2} title="History of present illness" titleEs="Historia de la enfermedad actual">
        <PaperTextarea
          label="Mechanism of injury, onset, prior treatment"
          name="history"
          rows={4}
          defaultValue={str(initial, "history")}
        />
      </PaperSection>

      <PaperSection num={3} title="Examination findings" titleEs="Hallazgos del examen">
        <PaperTextarea
          label="Objective findings (ROM, palpation, orthopedic / neurological tests)"
          name="exam_findings"
          rows={5}
          defaultValue={str(initial, "exam_findings")}
        />
      </PaperSection>

      <PaperSection num={4} title="Diagnosis" titleEs="Diagnóstico">
        <PaperTextarea
          label="Diagnoses / ICD-10 codes"
          name="diagnosis"
          rows={3}
          defaultValue={str(initial, "diagnosis")}
        />
      </PaperSection>

      <PaperSection num={5} title="Treatment plan" titleEs="Plan de tratamiento">
        <PaperTextarea
          label="Plan of care, frequency, referrals"
          name="plan"
          rows={4}
          defaultValue={str(initial, "plan")}
        />
      </PaperSection>

      <PaperSection num={6} title="Provider attestation" titleEs="Certificación del proveedor">
        <div className="grid grid-cols-2 gap-4">
          <PaperField
            label="Patient name (print)"
            name="patient_name_print"
            defaultValue={str(initial, "patient_name_print") || patientName}
          />
          <PaperField
            label="Date"
            name="signed_date"
            type="date"
            defaultValue={str(initial, "signed_date") || today}
          />
        </div>
      </PaperSection>

      <SignatureRow
        initial={initial}
        fields={[{ name: "provider_signature", label: "Provider signature" }]}
      />
    </>
  );
}

export function FollowUpDoc({ initial, patientName, today }: DocProps) {
  return (
    <>
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
    </>
  );
}

export const DOC_COMPONENTS: Record<
  ClinicalDocSlug,
  (props: DocProps) => React.ReactNode
> = {
  nofa: NofaDoc,
  emc: EmcDoc,
  "initial-report": InitialReportDoc,
  "follow-up": FollowUpDoc,
};
