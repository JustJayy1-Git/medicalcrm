import { PaperIdentStrip, PaperSheet } from "@/components/clinical/paper-doc";
import { SignaturePad } from "@/components/signature-pad";
import { addTherapySessionAction } from "@/app/therapy/cases/[id]/actions";
import { SOAP_PROCEDURES } from "@/lib/therapy/therapy";
import type { ReactNode } from "react";

/**
 * Verbatim transcription of the practice's paper "Therapy SOAP Note".
 * One is filled and signed on every therapy visit; the date auto-populates
 * and each save creates a new note in the patient's file.
 * Do not paraphrase the wording.
 */

function str(initial: Record<string, unknown>, key: string): string {
  return typeof initial[key] === "string" ? (initial[key] as string) : "";
}

function checked(initial: Record<string, unknown>, key: string): boolean {
  return initial[key] === "1" || initial[key] === true;
}

function Check({
  i,
  name,
  label,
}: {
  i: Record<string, unknown>;
  name: string;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-[10.5px] leading-tight">
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={checked(i, name)}
        className="h-[13px] w-[13px] shrink-0 accent-black"
      />
      {label}
    </label>
  );
}

/** "[ ]R [ ]L  <label>" complaint row. */
function RlComplaint({
  i,
  name,
  label,
  order,
}: {
  i: Record<string, unknown>;
  name: string;
  label: string;
  order: "rl" | "lr";
}) {
  const boxes = order === "rl" ? (["r", "R"] as const) : (["l", "L"] as const);
  const second = order === "rl" ? (["l", "L"] as const) : (["r", "R"] as const);
  return (
    <div className="flex items-center gap-2 border-b border-black/30 pb-0.5 text-[10.5px]">
      <label className="flex cursor-pointer items-center gap-1">
        <input
          type="checkbox"
          name={`${name}_${boxes[0]}`}
          value="1"
          defaultChecked={checked(i, `${name}_${boxes[0]}`)}
          className="h-[12px] w-[12px] accent-black"
        />
        {boxes[1]}
      </label>
      <label className="flex cursor-pointer items-center gap-1">
        <input
          type="checkbox"
          name={`${name}_${second[0]}`}
          value="1"
          defaultChecked={checked(i, `${name}_${second[0]}`)}
          className="h-[12px] w-[12px] accent-black"
        />
        {second[1]}
      </label>
      <span>{label}</span>
    </div>
  );
}

function SingleComplaint({
  i,
  name,
  label,
}: {
  i: Record<string, unknown>;
  name: string;
  label: string;
}) {
  return (
    <div className="border-b border-black/30 pb-0.5">
      <Check i={i} name={name} label={label} />
    </div>
  );
}

function SectionHead({ children }: { children: ReactNode }) {
  return (
    <h3 className="m-0 inline-block border-b-2 border-black text-[11.5px] font-extrabold uppercase tracking-[0.04em] text-[#0b4f3f]">
      {children}
    </h3>
  );
}

/** Exercise / re-education row: checkbox + region, routine text beside it. */
function RoutineRow({
  i,
  name,
  region,
  routine,
}: {
  i: Record<string, unknown>;
  name: string;
  region: string;
  routine: string;
}) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-start gap-3 border-b border-black/25 py-1">
      <Check i={i} name={name} label={region} />
      <p className="m-0 text-[8.5px] font-semibold uppercase leading-snug">{routine}</p>
    </div>
  );
}

export function TherapySoapNoteForm({
  caseId,
  patientId,
  patientName,
  today,
  ident,
  initial = {},
  readOnly = false,
  sessionDate,
}: {
  caseId?: string;
  patientId?: string;
  patientName: string;
  today: string;
  ident: Array<{ label: string; value: string }>;
  initial?: Record<string, unknown>;
  readOnly?: boolean;
  sessionDate?: string;
}) {
  const i = initial;

  const sheet = (
    <PaperSheet title="Therapy SOAP Note" page={1} totalPages={1}>
      <PaperIdentStrip fields={ident} />
      <div className="space-y-2.5 px-7 pt-4 text-[11px]">
        <div className="flex items-baseline gap-2">
          <span className="shrink-0 font-bold">Patient Name:</span>
          <input
            type="text"
            name="patient_name"
            defaultValue={str(i, "patient_name") || patientName}
            className="min-w-0 flex-1 border-0 border-b border-black bg-transparent px-1 text-[11px] focus:outline-none"
            style={{ boxShadow: "none" }}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <label className="flex items-baseline gap-2">
            <span className="shrink-0 font-bold">Date:</span>
            <input
              type="date"
              name="session_date"
              required
              defaultValue={sessionDate ?? str(i, "session_date") ?? today}
              className="min-w-0 flex-1 border-0 border-b border-black bg-transparent px-1 text-[11px] focus:outline-none"
              style={{ boxShadow: "none" }}
            />
          </label>
          <label className="flex items-baseline gap-2">
            <span className="shrink-0 font-bold">Blood Pressure:</span>
            <input
              type="text"
              name="blood_pressure"
              defaultValue={str(i, "blood_pressure")}
              className="min-w-0 flex-1 border-0 border-b border-black bg-transparent px-1 text-[11px] focus:outline-none"
              style={{ boxShadow: "none" }}
            />
          </label>
          <label className="flex items-baseline gap-2">
            <span className="shrink-0 font-bold">Pulse:</span>
            <input
              type="text"
              name="pulse"
              defaultValue={str(i, "pulse")}
              className="min-w-0 flex-1 border-0 border-b border-black bg-transparent px-1 text-[11px] focus:outline-none"
              style={{ boxShadow: "none" }}
            />
          </label>
        </div>

        <p className="m-0 border-b-2 border-black/70 pb-0.5 text-[11px] font-extrabold">
          Patient complain of the following:
        </p>
        <div className="grid grid-cols-3 gap-x-8 gap-y-1">
          <div className="space-y-1">
            <RlComplaint i={i} name="comp_humerus" label="Humerus Pain" order="rl" />
            <RlComplaint i={i} name="comp_shoulder" label="Shoulder Pain" order="rl" />
            <RlComplaint i={i} name="comp_elbow" label="Elbow Pain" order="rl" />
            <RlComplaint i={i} name="comp_forearm" label="Forearm Pain" order="rl" />
            <RlComplaint i={i} name="comp_wrist" label="Wrist Pain" order="rl" />
            <RlComplaint i={i} name="comp_hand_numbness" label="Hand  Numbness" order="rl" />
            <RlComplaint i={i} name="comp_knee" label="Knee Pain" order="rl" />
            <RlComplaint i={i} name="comp_ankle" label="Ankle pain" order="rl" />
            <SingleComplaint i={i} name="comp_chest" label="Chest pain" />
          </div>
          <div className="space-y-1">
            <RlComplaint i={i} name="comp_femur" label="Femur Pain" order="lr" />
            <RlComplaint i={i} name="comp_leg_numbness" label="Leg Numbness" order="lr" />
            <RlComplaint i={i} name="comp_ribs" label="Ribs Pain" order="lr" />
            <RlComplaint i={i} name="comp_hip" label="Hip Pain" order="lr" />
            <RlComplaint i={i} name="comp_foot" label="Foot Pain" order="lr" />
            <SingleComplaint i={i} name="comp_neck" label="Neck Pain" />
            <SingleComplaint i={i} name="comp_upper_back" label="Upper Back Pain" />
            <SingleComplaint i={i} name="comp_mid_back" label="Mid Back Pain" />
            <SingleComplaint i={i} name="comp_low_back" label="Low back" />
          </div>
          <div className="space-y-1">
            <SingleComplaint i={i} name="comp_headaches" label="Headaches" />
            <SingleComplaint i={i} name="comp_stiffness" label="General Stiffness" />
            <SingleComplaint i={i} name="comp_dizzines" label="Dizzines" />
            <SingleComplaint i={i} name="comp_breathing" label="Difficulty / unable breathing" />
            <SingleComplaint i={i} name="comp_ringing_ears" label="Ringing Ears" />
            <SingleComplaint i={i} name="comp_desequilibrium" label="Desequilibrium" />
            <SingleComplaint i={i} name="comp_muscle_tightnes" label="Muscle Tightnes" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-black/40 py-1.5">
          <span className="text-[11px] font-bold">ROM:</span>
          <Check i={i} name="rom_increase" label="INCREASE" />
          <span className="opacity-40">|</span>
          <Check i={i} name="rom_same" label="SAME" />
          <span className="opacity-40">|</span>
          <Check i={i} name="rom_descrease" label="DESCREASE" />
          <span className="opacity-40">|</span>
          <span className="text-[11px] font-bold">PAIN LEVEL</span>
          <span className="flex items-center gap-1.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((n) => (
              <label key={n} className="flex cursor-pointer flex-col items-center text-[9px]">
                <input
                  type="radio"
                  name="pain_level"
                  value={n}
                  defaultChecked={str(i, "pain_level") === n}
                  className="h-[13px] w-[13px] accent-black"
                />
                {n}
              </label>
            ))}
          </span>
        </div>

        <SectionHead>Therapy Procedure</SectionHead>
        <div className="grid grid-cols-3 gap-x-8 gap-y-1">
          {SOAP_PROCEDURES.map((p) => (
            <div key={p.code} className="flex items-center gap-2 border-b border-black/25 pb-0.5">
              <Check i={i} name={`proc_${p.code}`} label={`${p.code}`} />
              <span className="text-[10.5px]">{p.label}</span>
            </div>
          ))}
        </div>

        <h3 className="m-0 text-center text-[11.5px] font-extrabold uppercase underline underline-offset-2">
          Therapeutic Exercises
        </h3>
        <div>
          <RoutineRow i={i} name="ex_cervical" region="Cervical 1-2" routine="1-PROM+ISOMETRIC ROTATION+FLEX+ISOMETRIC-EXT" />
          <RoutineRow
            i={i}
            name="ex_thoracic"
            region="Thoracic"
            routine="FACE UP:HANDS BEHING HEAD, LIFT LEGS OFF THE FLOOR WHILE LOOKING AT TOES + BEND LEGS AND BRING TOWARDS RIGHT HIP AND LEFT HIP+BEND AND CROSS LEGS AND BRING TO CHEST+BENDS LEG WHILE KEEPING FEET ON FLOOR, HANDS BEHING HEAD , LIFT HEAD AND BACK OF THE FLOOR."
          />
          <RoutineRow
            i={i}
            name="ex_lumbar"
            region="Lumbar"
            routine="PELVIC CLOCK+THE BRIDGE+LOWER BACK ROT+KNEE TO CHEST+ BACK EXT LIFT+TRUNK EXT+EXT LEG RAISE+KNEE TO CHEST+BACK EXT LIFT+TRUNK EXT+EXT LEG RAISE+KNEE+SINGLE LEG RAISE."
          />
          <RoutineRow
            i={i}
            name="ex_shoulder"
            region="Shoulder"
            routine="HITH HICKER LEFT+SIDE LIFT+EXT ROTA LIFT+FINGER LADER+EST/INT ROT FULL+INNER THORACIC FULL+DIAGONAL FULL BACK+FRONT LIFT."
          />
          <RoutineRow
            i={i}
            name="ex_elbow_wrist"
            region="Elbow(1) Wrist (2/3)"
            routine="1-FLEX+EXT+ROT. 2-ISOMETRIC WRIST FLEX+EXT. 3- ISOMETRIC ROT INT/EXT+STRECH"
          />
          <RoutineRow
            i={i}
            name="ex_knee"
            region="Knee"
            routine="SINGLE KNEE FLEX/EXT TO CHEST+DOUBLE KNEE FLEX TO CHEST+QUDICEPS STRECH"
          />
          <RoutineRow
            i={i}
            name="ex_hip"
            region="Hip"
            routine="HIP FLEX LIFT+ADO/ABC RAISE+ADO SQUEEZE+HIP EXT+ STEP LIPS+STRAING LEG LIFT."
          />
        </div>

        <h3 className="m-0 text-center text-[11.5px] font-extrabold uppercase underline underline-offset-2">
          Neuromuscular Re-Education:
        </h3>
        <div>
          <RoutineRow
            i={i}
            name="nmr_cervical"
            region="Cervical"
            routine="CONT/RELAX+HBT-SPLENIUS GROUP, ELEVATOR SCAPULAR , UPPER TRAPEZIUS"
          />
          <RoutineRow
            i={i}
            name="nmr_thoracic"
            region="Thoracic"
            routine="CONT/RELAX RHOMBS, LATISSIMUS  DORSI , SERRTUS, PACTORALES , INFRA/SUPRASPINSTUS"
          />
          <RoutineRow
            i={i}
            name="nmr_lumbar"
            region="Lumbar"
            routine="CONT/RELAX + QUADRATUS  LUMBORUM  ILISOAS"
          />
        </div>

        <SectionHead>Assement Post Treatment</SectionHead>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <SingleComplaint i={i} name="asmt_responded_well" label="Patient Responded well today's treatment" />
          <SingleComplaint i={i} name="asmt_good_progress" label="Patient is making good progress" />
          <SingleComplaint i={i} name="asmt_improving_slowly" label="Patient is improving slowly" />
          <SingleComplaint i={i} name="asmt_slow_progress" label="Patient is making slow progress" />
          <SingleComplaint i={i} name="asmt_improving_quicky" label="Patient is improving quicky" />
        </div>

        <label className="block">
          <span className="text-[11px] font-bold">Notes:</span>
          <textarea
            name="notes"
            rows={2}
            defaultValue={str(i, "notes")}
            className="mt-1 w-full resize-y border-0 border-b border-black/50 bg-transparent px-1 py-0.5 text-[11px] focus:border-black focus:outline-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 20px, rgba(0,0,0,0.12) 20px, rgba(0,0,0,0.12) 21px)",
              lineHeight: "21px",
            }}
          />
        </label>

        <div className="grid grid-cols-2 gap-10 pt-2">
          <SignaturePad
            name="patient_signature"
            label="Patient Signature"
            initialDataUrl={str(i, "patient_signature") || null}
            heightPx={54}
            variant="line"
          />
          <SignaturePad
            name="therapist_signature"
            label="Therapist Signature"
            initialDataUrl={str(i, "therapist_signature") || null}
            heightPx={54}
            variant="line"
          />
        </div>

        <div className="pb-5 pt-1 text-[10px]">
          <p className="m-0 underline">
            My signature in the document, attest the fact that the services set forth
            herein were actually rendered.
          </p>
          <p className="m-0 underline">
            The person rendere the medical services for which paynent  will be claimed
            has explained the services to me in detaill.
          </p>
        </div>

        {!readOnly ? (
          <div className="flex justify-end pb-6">
            <button
              type="submit"
              className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white shadow-sm"
            >
              Save today&apos;s note
            </button>
          </div>
        ) : null}
      </div>
    </PaperSheet>
  );

  if (readOnly) {
    return (
      <fieldset disabled className="m-0 border-0 p-0">
        {sheet}
      </fieldset>
    );
  }

  return (
    <form action={addTherapySessionAction}>
      <input type="hidden" name="case_id" value={caseId} />
      <input type="hidden" name="patient_id" value={patientId} />
      {sheet}
    </form>
  );
}
