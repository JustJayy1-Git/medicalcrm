import {
  PaperCheck,
  PaperInline,
  PaperSheet,
} from "@/components/clinical/paper-doc";
import { SignaturePad } from "@/components/signature-pad";
import type { ReactNode } from "react";

/**
 * Faithful digital version of the practice's paper "Initial Evaluation"
 * (8 pages). Section wording, options, and order mirror the original
 * document — do not paraphrase when editing.
 */

type DocProps = {
  initial: Record<string, unknown>;
  patientName: string;
  today: string;
};

function str(initial: Record<string, unknown>, key: string): string {
  return typeof initial[key] === "string" ? (initial[key] as string) : "";
}

function checked(initial: Record<string, unknown>, key: string): boolean {
  return initial[key] === "1" || initial[key] === true;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="m-0 border-b border-black/60 pb-0.5 text-[11.5px] font-extrabold uppercase tracking-[0.04em]">
      {children}
    </h2>
  );
}

function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 ${className}`.trim()}>
      {children}
    </div>
  );
}

/** "Label: [ ] Absent  [ ] Present" + optional trailing extras. */
function AbsentPresent({
  i,
  label,
  name,
  extras,
}: {
  i: Record<string, unknown>;
  label: string;
  name: string;
  extras?: ReactNode;
}) {
  return (
    <Row>
      <span className="w-[110px] shrink-0 text-[11px] font-semibold">{label}:</span>
      <PaperCheck name={`${name}_absent`} label="Absent" defaultChecked={checked(i, `${name}_absent`)} />
      <PaperCheck name={`${name}_present`} label="Present" defaultChecked={checked(i, `${name}_present`)} />
      {extras}
    </Row>
  );
}

function RL({ i, name }: { i: Record<string, unknown>; name: string }) {
  return (
    <>
      <PaperCheck name={`${name}_r`} label="(R)" defaultChecked={checked(i, `${name}_r`)} />
      <PaperCheck name={`${name}_l`} label="(L)" defaultChecked={checked(i, `${name}_l`)} />
    </>
  );
}

function Levels({ i, name, levels }: { i: Record<string, unknown>; name: string; levels: string[] }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      {levels.map((lv) => (
        <PaperCheck
          key={lv}
          name={`${name}_${lv.toLowerCase()}`}
          label={lv}
          defaultChecked={checked(i, `${name}_${lv.toLowerCase()}`)}
        />
      ))}
    </span>
  );
}

/** ROM line: "Flexion  [ ] Normal (40°)  [ ] Pain  [ ] Decreased" */
function Rom({
  i,
  label,
  name,
  deg,
}: {
  i: Record<string, unknown>;
  label: string;
  name: string;
  deg: string;
}) {
  return (
    <Row>
      <span className="w-[110px] shrink-0 text-[11px]">{label}</span>
      <PaperCheck name={`${name}_normal`} label={`Normal (${deg})`} defaultChecked={checked(i, `${name}_normal`)} />
      <PaperCheck name={`${name}_pain`} label="Pain" defaultChecked={checked(i, `${name}_pain`)} />
      <PaperCheck name={`${name}_decreased`} label="Decreased" defaultChecked={checked(i, `${name}_decreased`)} />
    </Row>
  );
}

function RomRestrictions({ i, name }: { i: Record<string, unknown>; name: string }) {
  return (
    <Row>
      <span className="text-[11px] font-semibold">Ranges of Motion:</span>
      <PaperCheck name={`${name}_restrictions`} label="Restrictions" defaultChecked={checked(i, `${name}_restrictions`)} />
      <PaperCheck name={`${name}_mild`} label="Mild" defaultChecked={checked(i, `${name}_mild`)} />
      <PaperCheck name={`${name}_moderate`} label="Moderate" defaultChecked={checked(i, `${name}_moderate`)} />
      <PaperCheck name={`${name}_severe`} label="Severe" defaultChecked={checked(i, `${name}_severe`)} />
    </Row>
  );
}

function YesNo({ i, label, name }: { i: Record<string, unknown>; label: string; name: string }) {
  return (
    <Row>
      <span className="min-w-[150px] text-[11px]">{label}</span>
      <PaperCheck name={`${name}_yes`} label="Yes" defaultChecked={checked(i, `${name}_yes`)} />
      <PaperCheck name={`${name}_no`} label="No" defaultChecked={checked(i, `${name}_no`)} />
    </Row>
  );
}

/** Chief-complaint pain block, exactly as printed. */
function PainBlock({
  i,
  title,
  name,
  freeTitle,
}: {
  i: Record<string, unknown>;
  title?: string;
  name: string;
  freeTitle?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {freeTitle ? (
        <PaperInline label="Pain:" name={`${name}_site`} defaultValue={str(i, `${name}_site`)} className="max-w-md font-extrabold" />
      ) : (
        <p className="m-0 text-[11.5px] font-extrabold">{title}</p>
      )}
      <Row>
        <PaperCheck name={`${name}_constant`} label="Constant/Comes and goes" defaultChecked={checked(i, `${name}_constant`)} />
        <PaperCheck name={`${name}_sharp`} label="Sharp/Dull" defaultChecked={checked(i, `${name}_sharp`)} />
        <PaperCheck name={`${name}_achy`} label="Achy/Tightness" defaultChecked={checked(i, `${name}_achy`)} />
      </Row>
      <Row>
        <span className="text-[11px]">-Scale Pain</span>
        <Levels i={i} name={`${name}_scale`} levels={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]} />
      </Row>
      <PaperInline label="Radiating/Tingling/Numbness:" name={`${name}_radiating`} defaultValue={str(i, `${name}_radiating`)} />
      <PaperInline label="-What makes the pain better or worse:" name={`${name}_better_worse`} defaultValue={str(i, `${name}_better_worse`)} />
    </div>
  );
}

const MEDICAL_HISTORY_LEFT: Array<[string, string]> = [
  ["Heart attack", "mh_heart_attack"],
  ["High blood pressure", "mh_hbp"],
  ["Asthma", "mh_asthma"],
  ["Stomach ulcer", "mh_ulcer"],
  ["Arthritis", "mh_arthritis"],
  ["Glaucoma", "mh_glaucoma"],
  ["Depression/anxiety", "mh_depression"],
  ["Anemia", "mh_anemia"],
  ["Hepatitis", "mh_hepatitis"],
  ["Chronic Infection", "mh_chronic_infection"],
  ["Osteoporosis", "mh_osteoporosis"],
];

const MEDICAL_HISTORY_RIGHT: Array<[string, string]> = [
  ["Cancer", "mh_cancer"],
  ["Irregular heartbeat", "mh_irregular_heartbeat"],
  ["Diabetes", "mh_diabetes"],
  ["Stroke", "mh_stroke"],
  ["Kidney disease", "mh_kidney"],
  ["Thyroid disease", "mh_thyroid"],
  ["Tuberculosis", "mh_tb"],
  ["High Cholesterol", "mh_cholesterol"],
  ["COPD", "mh_copd"],
  ["Post menopausal", "mh_menopausal"],
];

export function InitialEvaluationDoc({ initial: i, patientName, today }: DocProps) {
  const T = 8;
  return (
    <>
      {/* ---------------------------------------------------------- page 1 */}
      <PaperSheet title="Initial Evaluation" page={1} totalPages={T}>
        <div className="space-y-2 px-6 pt-3">
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            <PaperInline label="Patient Name:" name="patient_name" defaultValue={str(i, "patient_name") || patientName} />
            <PaperInline label="Date:" name="eval_date" type="date" defaultValue={str(i, "eval_date") || today} />
          </div>
          <Row>
            <span className="text-[11px] font-semibold">Type of Case:</span>
            <PaperCheck name="case_accident" label="Accident" defaultChecked={checked(i, "case_accident")} />
            <PaperCheck name="case_slip_fall" label="Slip & Fall" defaultChecked={checked(i, "case_slip_fall")} />
            <PaperInline label="Other:" name="case_other" defaultValue={str(i, "case_other")} className="min-w-[180px] flex-1" />
          </Row>
          <Row>
            <PaperInline label="Date of accident:" name="accident_date" type="date" defaultValue={str(i, "accident_date")} className="min-w-[220px]" />
            <span className="text-[11px] font-semibold">Previous Accident</span>
            <PaperCheck name="prev_accident_yes" label="Yes" defaultChecked={checked(i, "prev_accident_yes")} />
            <PaperCheck name="prev_accident_no" label="No" defaultChecked={checked(i, "prev_accident_no")} />
            <PaperInline label="When:" name="prev_accident_when" defaultValue={str(i, "prev_accident_when")} className="min-w-[160px] flex-1" />
          </Row>
          <Row>
            <PaperInline label="Date of Birth:" name="dob" type="date" defaultValue={str(i, "dob")} className="min-w-[190px]" />
            <PaperInline label="Age:" name="age" defaultValue={str(i, "age")} className="w-[90px]" />
            <span className="text-[11px] font-semibold">Sex:</span>
            <PaperCheck name="sex_f" label="F" defaultChecked={checked(i, "sex_f")} />
            <span className="text-[11px]">(Pregnant):</span>
            <PaperCheck name="pregnant_yes" label="Yes" defaultChecked={checked(i, "pregnant_yes")} />
            <PaperCheck name="pregnant_no" label="No" defaultChecked={checked(i, "pregnant_no")} />
            <PaperCheck name="sex_m" label="M" defaultChecked={checked(i, "sex_m")} />
          </Row>
          <div className="grid grid-cols-6 gap-3">
            <PaperInline label="Height:" name="height" defaultValue={str(i, "height")} />
            <PaperInline label="Weight:" name="weight" defaultValue={str(i, "weight")} />
            <PaperInline label="BP:" name="bp" defaultValue={str(i, "bp")} />
            <PaperInline label="R:" name="resp" defaultValue={str(i, "resp")} />
            <PaperInline label="Pulse:" name="pulse" defaultValue={str(i, "pulse")} />
            <PaperInline label="T:" name="temp" defaultValue={str(i, "temp")} />
          </div>

          <SectionTitle>History:</SectionTitle>
          <Row>
            <span className="text-[11px] font-semibold">Patient was:</span>
            <PaperCheck name="pos_driver" label="Driver" defaultChecked={checked(i, "pos_driver")} />
            <PaperCheck name="pos_front" label="Front Passenger" defaultChecked={checked(i, "pos_front")} />
            <PaperCheck name="pos_back" label="Back Passenger (R/L)" defaultChecked={checked(i, "pos_back")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Accident occurred:</span>
            <PaperCheck name="occ_morning" label="Morning" defaultChecked={checked(i, "occ_morning")} />
            <PaperCheck name="occ_afternoon" label="Afternoon" defaultChecked={checked(i, "occ_afternoon")} />
            <PaperCheck name="occ_evening" label="Evening" defaultChecked={checked(i, "occ_evening")} />
          </Row>
          <PaperInline label="How did it happen?" name="how_happened" defaultValue={str(i, "how_happened")} />
          <Row>
            <span className="text-[11px] font-semibold">Patient was:</span>
            <PaperCheck name="conscious" label="Conscious" defaultChecked={checked(i, "conscious")} />
            <PaperCheck name="unconscious" label="Unconscious" defaultChecked={checked(i, "unconscious")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Seat belt:</span>
            <PaperCheck name="seatbelt_yes" label="Yes" defaultChecked={checked(i, "seatbelt_yes")} />
            <PaperCheck name="seatbelt_no" label="No" defaultChecked={checked(i, "seatbelt_no")} />
            <span className="ml-6 text-[11px] font-semibold">Airbag Deployed</span>
            <PaperCheck name="airbag_yes" label="Yes" defaultChecked={checked(i, "airbag_yes")} />
            <PaperCheck name="airbag_no" label="No" defaultChecked={checked(i, "airbag_no")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">When did first symptoms appear?</span>
            <PaperCheck name="sym_right_away" label="Right away" defaultChecked={checked(i, "sym_right_away")} />
            <PaperCheck name="sym_next_day" label="Couple hrs later / Next day" defaultChecked={checked(i, "sym_next_day")} />
            <PaperCheck name="sym_days_later" label="Days later" defaultChecked={checked(i, "sym_days_later")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Did the patient go to the hospital?</span>
            <PaperCheck name="hospital_yes" label="Yes" defaultChecked={checked(i, "hospital_yes")} />
            <PaperCheck name="hospital_no" label="No" defaultChecked={checked(i, "hospital_no")} />
          </Row>

          <SectionTitle>Medical History</SectionTitle>
          <Row>
            <PaperCheck name="med_allergies" label="Medications Allergies" defaultChecked={checked(i, "med_allergies")} />
            <PaperCheck name="food_allergies" label="Food Allergies" defaultChecked={checked(i, "food_allergies")} />
          </Row>
          <YesNo i={i} label="Do you take any medication at this time?" name="takes_medication" />
          <Row>
            <PaperInline label="Surgeries:" name="surgeries" defaultValue={str(i, "surgeries")} className="min-w-[220px] flex-1" />
            <PaperInline label="If yes when?" name="surgeries_when" defaultValue={str(i, "surgeries_when")} className="min-w-[180px] flex-1" />
          </Row>
          <Row>
            <PaperCheck name="smoke" label="Smoke" defaultChecked={checked(i, "smoke")} />
            <PaperCheck name="alcohol" label="Alcohol" defaultChecked={checked(i, "alcohol")} />
            <PaperCheck name="coffee" label="Coffee" defaultChecked={checked(i, "coffee")} />
          </Row>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <div className="space-y-1">
              {MEDICAL_HISTORY_LEFT.map(([label, name]) => (
                <YesNo key={name} i={i} label={label} name={name} />
              ))}
            </div>
            <div className="space-y-1">
              {MEDICAL_HISTORY_RIGHT.map(([label, name]) => (
                <YesNo key={name} i={i} label={label} name={name} />
              ))}
            </div>
          </div>
        </div>
        <div className="h-6" />
      </PaperSheet>

      {/* ---------------------------------------------------------- page 2 */}
      <PaperSheet title="Initial Evaluation — Chief Complaint" page={2} totalPages={T}>
        <div className="space-y-4 px-6 pt-3">
          <SectionTitle>Chief Complaint:</SectionTitle>
          <PainBlock i={i} title="Cervical Pain:" name="cc_cervical" />
          <PainBlock i={i} title="Thoracic Pain:" name="cc_thoracic" />
          <PainBlock i={i} title="Lumbar Pain:" name="cc_lumbar" />
          <SectionTitle>Other Complaints:</SectionTitle>
          <PainBlock i={i} name="cc_other1" freeTitle />
          <PainBlock i={i} name="cc_other2" freeTitle />
        </div>
        <div className="h-6" />
      </PaperSheet>

      {/* ---------------------------------------------------------- page 3 */}
      <PaperSheet title="Initial Evaluation — Examination" page={3} totalPages={T}>
        <div className="space-y-2 px-6 pt-3">
          <Row>
            <span className="text-[11px] font-semibold">Open wounds/cuts:</span>
            <PaperCheck name="wounds_yes" label="yes" defaultChecked={checked(i, "wounds_yes")} />
            <PaperCheck name="wounds_no" label="no" defaultChecked={checked(i, "wounds_no")} />
            <PaperInline label="if yes (areas):" name="wounds_areas" defaultValue={str(i, "wounds_areas")} className="min-w-[220px] flex-1" />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Head:</span>
            <span className="text-[11px]">hematoma</span>
            <PaperCheck name="head_hematoma_yes" label="yes" defaultChecked={checked(i, "head_hematoma_yes")} />
            <PaperCheck name="head_hematoma_no" label="no" defaultChecked={checked(i, "head_hematoma_no")} />
            <span className="text-[11px]">Laceration</span>
            <PaperCheck name="head_laceration_yes" label="yes" defaultChecked={checked(i, "head_laceration_yes")} />
            <PaperCheck name="head_laceration_no" label="no" defaultChecked={checked(i, "head_laceration_no")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Eye vision:</span>
            <PaperCheck name="eye_good" label="good" defaultChecked={checked(i, "eye_good")} />
            <PaperCheck name="eye_decreased" label="Decreased" defaultChecked={checked(i, "eye_decreased")} />
            <PaperCheck name="eye_glasses" label="Glasses" defaultChecked={checked(i, "eye_glasses")} />
            <PaperCheck name="eye_contact" label="Contact" defaultChecked={checked(i, "eye_contact")} />
            <PaperCheck name="eye_other" label="Other" defaultChecked={checked(i, "eye_other")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Ear hearing:</span>
            <PaperCheck name="ear_normal" label="Normal" defaultChecked={checked(i, "ear_normal")} />
            <PaperCheck name="ear_deafness" label="deafness" defaultChecked={checked(i, "ear_deafness")} />
            <PaperCheck name="ear_hypocusia" label="hypocusia" defaultChecked={checked(i, "ear_hypocusia")} />
            <PaperCheck name="ear_tinnitis" label="Tinnitis" defaultChecked={checked(i, "ear_tinnitis")} />
            <PaperCheck name="ear_pain" label="Pain" defaultChecked={checked(i, "ear_pain")} />
            <PaperCheck name="ear_discharge" label="Discharge" defaultChecked={checked(i, "ear_discharge")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Throat:</span>
            <PaperCheck name="throat_normal" label="Normal" defaultChecked={checked(i, "throat_normal")} />
            <PaperCheck name="throat_sore" label="Sore" defaultChecked={checked(i, "throat_sore")} />
            <PaperCheck name="throat_swallow" label="difficulty swallowing" defaultChecked={checked(i, "throat_swallow")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Cardiovascular:</span>
            <PaperCheck name="cv_normal" label="Normal (S1, S2, RRR, no M/R/G)" defaultChecked={checked(i, "cv_normal")} />
            <PaperCheck name="cv_chest_pain" label="chest pain" defaultChecked={checked(i, "cv_chest_pain")} />
            <PaperCheck name="cv_palpitation" label="Palpitation" defaultChecked={checked(i, "cv_palpitation")} />
            <PaperCheck name="cv_murmur" label="Murmur" defaultChecked={checked(i, "cv_murmur")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">GI:</span>
            <PaperCheck name="gi_normal" label="normal" defaultChecked={checked(i, "gi_normal")} />
            <PaperCheck name="gi_nausea" label="Nausea" defaultChecked={checked(i, "gi_nausea")} />
            <PaperCheck name="gi_heartburn" label="Heartburn" defaultChecked={checked(i, "gi_heartburn")} />
            <PaperCheck name="gi_vomiting" label="Vomiting" defaultChecked={checked(i, "gi_vomiting")} />
            <PaperCheck name="gi_constipation" label="Contipation" defaultChecked={checked(i, "gi_constipation")} />
            <PaperCheck name="gi_diarrea" label="Diarrea" defaultChecked={checked(i, "gi_diarrea")} />
            <PaperCheck name="gi_bleeding" label="Bleeding" defaultChecked={checked(i, "gi_bleeding")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Skin:</span>
            <PaperCheck name="skin_normal" label="Normal" defaultChecked={checked(i, "skin_normal")} />
            <PaperCheck name="skin_rash" label="Rash" defaultChecked={checked(i, "skin_rash")} />
            <PaperCheck name="skin_laceration" label="Laceration" defaultChecked={checked(i, "skin_laceration")} />
            <PaperCheck name="skin_abrasions" label="Abrasions" defaultChecked={checked(i, "skin_abrasions")} />
            <PaperCheck name="skin_hematomas" label="Hematomas" defaultChecked={checked(i, "skin_hematomas")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">C.N.S:</span>
            <PaperCheck name="cns_normal" label="Normal" defaultChecked={checked(i, "cns_normal")} />
            <PaperCheck name="cns_seizures" label="Seiszures" defaultChecked={checked(i, "cns_seizures")} />
            <PaperCheck name="cns_dizziness" label="Dizziness" defaultChecked={checked(i, "cns_dizziness")} />
            <PaperCheck name="cns_fainting" label="Fainting" defaultChecked={checked(i, "cns_fainting")} />
            <PaperCheck name="cns_headaches" label="Headaches" defaultChecked={checked(i, "cns_headaches")} />
          </Row>
          <Row>
            <span className="text-[11px] font-semibold">Neurology:</span>
            <PaperCheck name="neuro_cranial_wnl" label="Cranea nerves with normal limits" defaultChecked={checked(i, "neuro_cranial_wnl")} />
            <PaperCheck name="neuro_dtr_wnl" label="Deep tendon reflexes with normal limits" defaultChecked={checked(i, "neuro_dtr_wnl")} />
          </Row>

          <SectionTitle>Cervical Spine:</SectionTitle>
          <RomRestrictions i={i} name="cerv_rom" />
          <Rom i={i} label="Flexion" name="cerv_flexion" deg="40°" />
          <Rom i={i} label="Extension" name="cerv_extension" deg="40°" />
          <Rom i={i} label="Rt. Rotation" name="cerv_rt_rotation" deg="80°" />
          <Rom i={i} label="Lt. Rotation" name="cerv_lt_rotation" deg="80°" />
          <Rom i={i} label="Rt.Lat. Flexion" name="cerv_rt_lat_flexion" deg="45°" />
          <Rom i={i} label="Lt.Lat. Flexion" name="cerv_lt_lat_flexion" deg="45°" />
          <AbsentPresent i={i} label="Pain" name="cerv_pain" extras={<Levels i={i} name="cerv_pain" levels={["C1", "C2", "C3", "C4", "C5", "C6", "C7"]} />} />
          <AbsentPresent i={i} label="Terderness" name="cerv_tenderness" extras={<Levels i={i} name="cerv_tenderness" levels={["C1", "C2", "C3", "C4", "C5", "C6", "C7"]} />} />
          <AbsentPresent i={i} label="Hematomas" name="cerv_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="cerv_laceration" />
          <AbsentPresent i={i} label="Edema" name="cerv_edema" />
          <AbsentPresent i={i} label="Erythema" name="cerv_erythema" />
          <AbsentPresent
            i={i}
            label="Muscle Spasms"
            name="cerv_spasms"
            extras={
              <span className="flex flex-wrap items-baseline gap-x-3">
                <PaperCheck name="cerv_spasm_suboccipitals" label="Suboccipitals (RT/LT)" defaultChecked={checked(i, "cerv_spasm_suboccipitals")} />
                <PaperCheck name="cerv_spasm_scalene" label="Anterior scalene (RT/LT)" defaultChecked={checked(i, "cerv_spasm_scalene")} />
                <PaperCheck name="cerv_spasm_trapezius" label="Upper trapezius (RT/LT)" defaultChecked={checked(i, "cerv_spasm_trapezius")} />
                <PaperCheck name="cerv_spasm_levator" label="Levator Scapulae (RT/LT)" defaultChecked={checked(i, "cerv_spasm_levator")} />
                <PaperCheck name="cerv_spasm_scm" label="SCM (RT/LT)" defaultChecked={checked(i, "cerv_spasm_scm")} />
              </span>
            }
          />
          <AbsentPresent i={i} label="Radiculitis" name="cerv_radiculitis" extras={
            <>
              <Levels i={i} name="cerv_radiculitis" levels={["C1", "C2", "C3", "C4", "C5", "C6", "C7"]} />
              <span className="text-[11px]">Dermatomes</span>
            </>
          } />
        </div>
        <div className="h-6" />
      </PaperSheet>

      {/* ---------------------------------------------------------- page 4 */}
      <PaperSheet title="Initial Evaluation — Examination (cont.)" page={4} totalPages={T}>
        <div className="space-y-2 px-6 pt-3">
          <SectionTitle>Thoracolumbar Spine:</SectionTitle>
          <RomRestrictions i={i} name="thor_rom" />
          <Rom i={i} label="Flexion" name="thor_flexion" deg="90°" />
          <Rom i={i} label="Extension" name="thor_extension" deg="30°" />
          <Rom i={i} label="Rt. Rotation" name="thor_rt_rotation" deg="30°" />
          <Rom i={i} label="Lt. Rotation" name="thor_lt_rotation" deg="30°" />
          <Rom i={i} label="Rt.Lat.Flexion" name="thor_rt_lat_flexion" deg="30°" />
          <Rom i={i} label="Lt.Lat.Flexion" name="thor_lt_lat_flexion" deg="30°" />
          <AbsentPresent i={i} label="Pain" name="thor_pain" extras={<Levels i={i} name="thor_pain" levels={["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]} />} />
          <AbsentPresent i={i} label="Terderness" name="thor_tenderness" extras={<Levels i={i} name="thor_tenderness" levels={["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]} />} />
          <AbsentPresent i={i} label="Hematomas" name="thor_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="thor_laceration" />
          <AbsentPresent i={i} label="Edema" name="thor_edema" />
          <AbsentPresent i={i} label="Erythema" name="thor_erythema" />
          <AbsentPresent
            i={i}
            label="Muscle Spasms"
            name="thor_spasms"
            extras={
              <span className="flex flex-wrap items-baseline gap-x-3">
                <PaperCheck name="thor_spasm_rhomboid" label="Rhomboid (RT/LT)" defaultChecked={checked(i, "thor_spasm_rhomboid")} />
                <PaperCheck name="thor_spasm_serratus" label="Serratus Anterior (RT/LT)" defaultChecked={checked(i, "thor_spasm_serratus")} />
                <PaperCheck name="thor_spasm_longissimus" label="Longissimus Thoracis (RT/LT)" defaultChecked={checked(i, "thor_spasm_longissimus")} />
                <PaperCheck name="thor_spasm_spinalis" label="Spinalis Thoracis (RT/LT)" defaultChecked={checked(i, "thor_spasm_spinalis")} />
              </span>
            }
          />

          <SectionTitle>Lumbar Spine:</SectionTitle>
          <AbsentPresent i={i} label="Pain" name="lumb_pain" extras={<Levels i={i} name="lumb_pain" levels={["L1", "L2", "L3", "L4", "L5", "S1"]} />} />
          <AbsentPresent i={i} label="Terderness" name="lumb_tenderness" extras={<Levels i={i} name="lumb_tenderness" levels={["L1", "L2", "L3", "L4", "L5", "S1"]} />} />
          <AbsentPresent i={i} label="Hematomas" name="lumb_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="lumb_laceration" />
          <AbsentPresent i={i} label="Edema" name="lumb_edema" />
          <AbsentPresent i={i} label="Erythema" name="lumb_erythema" />
          <AbsentPresent
            i={i}
            label="Muscle Spasms"
            name="lumb_spasms"
            extras={
              <span className="flex flex-wrap items-baseline gap-x-3">
                <PaperCheck name="lumb_spasm_latissimus" label="Latissimus Darsi (RT/LT)" defaultChecked={checked(i, "lumb_spasm_latissimus")} />
                <PaperCheck name="lumb_spasm_quadratus" label="Quadratus Lumborum (RT/LT)" defaultChecked={checked(i, "lumb_spasm_quadratus")} />
                <PaperCheck name="lumb_spasm_erector" label="Erector Spinae (RT/LT)" defaultChecked={checked(i, "lumb_spasm_erector")} />
                <PaperCheck name="lumb_spasm_spinalis" label="Spinalis Thoracis (RT/LT)" defaultChecked={checked(i, "lumb_spasm_spinalis")} />
              </span>
            }
          />
          <AbsentPresent i={i} label="Radiculitis" name="lumb_radiculitis" extras={
            <>
              <Levels i={i} name="lumb_radiculitis" levels={["L1", "L2", "L3", "L4", "L5", "S1"]} />
              <span className="text-[11px]">Dermatomes</span>
            </>
          } />

          <SectionTitle>Shoulder Examinations:</SectionTitle>
          <AbsentPresent i={i} label="Pain" name="shoulder_pain" extras={<RL i={i} name="shoulder_pain" />} />
          <AbsentPresent i={i} label="Terderness" name="shoulder_tenderness" extras={<RL i={i} name="shoulder_tenderness" />} />
          <AbsentPresent i={i} label="Hematomas" name="shoulder_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="shoulder_laceration" />
          <AbsentPresent i={i} label="Edema" name="shoulder_edema" />
          <AbsentPresent i={i} label="Dermatites" name="shoulder_dermatites" />
          <AbsentPresent i={i} label="Muscle Spasms" name="shoulder_spasms" extras={<RL i={i} name="shoulder_spasms" />} />
          <Row>
            <span className="w-[110px] shrink-0 text-[11px] font-semibold">Muscle Strenath</span>
            <PaperCheck name="shoulder_strength_normal" label="Normal" defaultChecked={checked(i, "shoulder_strength_normal")} />
            <PaperCheck name="shoulder_strength_decreased" label="Decreased" defaultChecked={checked(i, "shoulder_strength_decreased")} />
          </Row>
        </div>
        <div className="h-6" />
      </PaperSheet>

      {/* ---------------------------------------------------------- page 5 */}
      <PaperSheet title="Initial Evaluation — Examination (cont.)" page={5} totalPages={T}>
        <div className="space-y-2 px-6 pt-3">
          <RomRestrictions i={i} name="shoulder_rom" />
          <Rom i={i} label="Flexion" name="shoulder_flexion" deg="180°" />
          <Rom i={i} label="Extension" name="shoulder_extension" deg="50°" />
          <Rom i={i} label="Abduction" name="shoulder_abduction" deg="180°" />
          <Rom i={i} label="Adduction" name="shoulder_adduction" deg="50°" />
          <Rom i={i} label="Inter. Rotation" name="shoulder_int_rotation" deg="70°" />
          <Rom i={i} label="Exter. Rotation" name="shoulder_ext_rotation" deg="90°" />

          <SectionTitle>Elbow/Forearm Examination:</SectionTitle>
          <AbsentPresent i={i} label="Pain" name="elbow_pain" extras={<RL i={i} name="elbow_pain" />} />
          <AbsentPresent i={i} label="Terderness" name="elbow_tenderness" extras={<RL i={i} name="elbow_tenderness" />} />
          <AbsentPresent i={i} label="Hematomas" name="elbow_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="elbow_laceration" />
          <AbsentPresent i={i} label="Edema" name="elbow_edema" />
          <AbsentPresent i={i} label="Deformities" name="elbow_deformities" />
          <AbsentPresent i={i} label="Muscle Spasms" name="elbow_spasms" extras={<RL i={i} name="elbow_spasms" />} />
          <Row>
            <span className="w-[110px] shrink-0 text-[11px] font-semibold">Muscle Strength</span>
            <PaperCheck name="elbow_strength_normal" label="Normal" defaultChecked={checked(i, "elbow_strength_normal")} />
            <PaperCheck name="elbow_strength_decreased" label="Decreased" defaultChecked={checked(i, "elbow_strength_decreased")} />
          </Row>
          <RomRestrictions i={i} name="elbow_rom" />
          <Rom i={i} label="Flexion" name="elbow_flexion" deg="180°" />
          <Rom i={i} label="Pronation" name="elbow_pronation" deg="80°" />
          <Rom i={i} label="Supination" name="elbow_supination" deg="80°" />

          <SectionTitle>Wrist and Hand Examination:</SectionTitle>
          <AbsentPresent i={i} label="Pain" name="wrist_pain" extras={<RL i={i} name="wrist_pain" />} />
          <AbsentPresent i={i} label="Terderness" name="wrist_tenderness" extras={<RL i={i} name="wrist_tenderness" />} />
          <AbsentPresent i={i} label="Hematomas" name="wrist_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="wrist_laceration" />
          <AbsentPresent i={i} label="Edema" name="wrist_edema" />
          <AbsentPresent i={i} label="Deformities" name="wrist_deformities" />
          <AbsentPresent i={i} label="Muscle Spasms" name="wrist_spasms" extras={<RL i={i} name="wrist_spasms" />} />
          <Row>
            <span className="w-[110px] shrink-0 text-[11px] font-semibold">Muscle Strength</span>
            <PaperCheck name="wrist_strength_normal" label="Normal" defaultChecked={checked(i, "wrist_strength_normal")} />
            <PaperCheck name="wrist_strength_decreased" label="Decreased" defaultChecked={checked(i, "wrist_strength_decreased")} />
          </Row>
        </div>
        <div className="h-6" />
      </PaperSheet>

      {/* ---------------------------------------------------------- page 6 */}
      <PaperSheet title="Initial Evaluation — Examination (cont.)" page={6} totalPages={T}>
        <div className="space-y-2 px-6 pt-3">
          <Row>
            <span className="text-[11px] font-semibold">Wrist Ranges of Motion:</span>
            <PaperCheck name="wrist_rom_restrictions" label="Restrictions" defaultChecked={checked(i, "wrist_rom_restrictions")} />
            <PaperCheck name="wrist_rom_mild" label="Mild" defaultChecked={checked(i, "wrist_rom_mild")} />
            <PaperCheck name="wrist_rom_moderate" label="Moderate" defaultChecked={checked(i, "wrist_rom_moderate")} />
            <PaperCheck name="wrist_rom_severe" label="Severe" defaultChecked={checked(i, "wrist_rom_severe")} />
          </Row>
          <Rom i={i} label="Flexion" name="wrist_flexion" deg="80°" />
          <Rom i={i} label="Extension" name="wrist_extension" deg="90°" />
          <Rom i={i} label="Ulna Deviation" name="wrist_ulna_dev" deg="45°" />
          <Rom i={i} label="Radial deviation" name="wrist_radial_dev" deg="15°" />

          <SectionTitle>Hip and Pelvic Examination:</SectionTitle>
          <AbsentPresent i={i} label="Pain" name="hip_pain" extras={<RL i={i} name="hip_pain" />} />
          <AbsentPresent i={i} label="Terderness" name="hip_tenderness" extras={<RL i={i} name="hip_tenderness" />} />
          <AbsentPresent i={i} label="Hematomas" name="hip_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="hip_laceration" />
          <AbsentPresent i={i} label="Edema" name="hip_edema" />
          <AbsentPresent i={i} label="Deformities" name="hip_deformities" />
          <AbsentPresent i={i} label="Muscle Spasms" name="hip_spasms" extras={<RL i={i} name="hip_spasms" />} />
          <Row>
            <span className="w-[110px] shrink-0 text-[11px] font-semibold">Muscle Strength</span>
            <PaperCheck name="hip_strength_normal" label="Normal" defaultChecked={checked(i, "hip_strength_normal")} />
            <PaperCheck name="hip_strength_decreased" label="Decreased" defaultChecked={checked(i, "hip_strength_decreased")} />
          </Row>
          <RomRestrictions i={i} name="hip_rom" />
          <Rom i={i} label="Flexion" name="hip_flexion" deg="120°" />
          <Rom i={i} label="Extension" name="hip_extension" deg="30°" />
          <Rom i={i} label="Abduction" name="hip_abduction" deg="50°" />
          <Rom i={i} label="Adduction" name="hip_adduction" deg="30°" />
          <Rom i={i} label="Inter. Rotation" name="hip_int_rotation" deg="40°" />
          <Rom i={i} label="Exter. Rotation" name="hip_ext_rotation" deg="45°" />

          <SectionTitle>Knee Examination:</SectionTitle>
          <AbsentPresent i={i} label="Pain" name="knee_pain" extras={<RL i={i} name="knee_pain" />} />
          <AbsentPresent i={i} label="Terderness" name="knee_tenderness" extras={<RL i={i} name="knee_tenderness" />} />
          <AbsentPresent i={i} label="Hematomas" name="knee_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="knee_laceration" />
          <AbsentPresent i={i} label="Edema" name="knee_edema" />
          <AbsentPresent i={i} label="Deformiities" name="knee_deformities" />
          <AbsentPresent i={i} label="Muscle Spasms" name="knee_spasms" extras={<RL i={i} name="knee_spasms" />} />
          <Row>
            <span className="w-[110px] shrink-0 text-[11px] font-semibold">Muscle Strength</span>
            <PaperCheck name="knee_strength_normal" label="Normal" defaultChecked={checked(i, "knee_strength_normal")} />
            <PaperCheck name="knee_strength_decreased" label="Decreased" defaultChecked={checked(i, "knee_strength_decreased")} />
          </Row>
          <RomRestrictions i={i} name="knee_rom" />
          <Rom i={i} label="Flexion" name="knee_flexion" deg="135°" />
        </div>
        <div className="h-6" />
      </PaperSheet>

      {/* ---------------------------------------------------------- page 7 */}
      <PaperSheet title="Initial Evaluation — Examination (cont.)" page={7} totalPages={T}>
        <div className="space-y-2 px-6 pt-3">
          <SectionTitle>Foot Examination:</SectionTitle>
          <AbsentPresent i={i} label="Pain" name="foot_pain" extras={<RL i={i} name="foot_pain" />} />
          <AbsentPresent i={i} label="Terderness" name="foot_tenderness" extras={<RL i={i} name="foot_tenderness" />} />
          <AbsentPresent i={i} label="Hematomas" name="foot_hematomas" />
          <AbsentPresent i={i} label="Laceratiion" name="foot_laceration" />
          <AbsentPresent i={i} label="Edema" name="foot_edema" />
          <AbsentPresent i={i} label="Deformiities" name="foot_deformities" />
          <AbsentPresent i={i} label="Muscle Spasms" name="foot_spasms" extras={<RL i={i} name="foot_spasms" />} />
          <Row>
            <span className="w-[110px] shrink-0 text-[11px] font-semibold">Muscle Strength</span>
            <PaperCheck name="foot_strength_normal" label="Normal" defaultChecked={checked(i, "foot_strength_normal")} />
            <PaperCheck name="foot_strength_decreased" label="Decreased" defaultChecked={checked(i, "foot_strength_decreased")} />
          </Row>
          <RomRestrictions i={i} name="foot_rom" />
          <PaperInline label="Extension:" name="foot_extension" defaultValue={str(i, "foot_extension")} className="max-w-md" />

          <SectionTitle>Ankle Examination:</SectionTitle>
          <Rom i={i} label="Dorsi-Flexion" name="ankle_dorsi" deg="45°" />
          <Rom i={i} label="Plantar-Extension" name="ankle_plantar" deg="45°" />
          <Rom i={i} label="Inversion" name="ankle_inversion" deg="30°" />
          <Rom i={i} label="Eversion" name="ankle_eversion" deg="20°" />

          <SectionTitle>Diagnosis Impression (ICD-10):</SectionTitle>
          <textarea
            name="diagnosis_impression"
            rows={4}
            defaultValue={str(i, "diagnosis_impression")}
            className="w-full resize-y border-0 border-b border-black/50 bg-transparent px-1 py-1 text-[12px] focus:border-black focus:outline-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 21px, rgba(0,0,0,0.12) 21px, rgba(0,0,0,0.12) 22px)",
              lineHeight: "22px",
            }}
          />
          <Row>
            <span className="text-[11px] font-semibold">Assessment:</span>
            <PaperCheck name="assessment_acute" label="Acute" defaultChecked={checked(i, "assessment_acute")} />
            <PaperCheck name="assessment_subacute" label="Subacute" defaultChecked={checked(i, "assessment_subacute")} />
            <PaperCheck name="assessment_chronic" label="Chronic" defaultChecked={checked(i, "assessment_chronic")} />
          </Row>
          <div className="space-y-1">
            <PaperCheck name="emc_condition" label="Emergency Medical Condition" defaultChecked={checked(i, "emc_condition")} />
            <br />
            <PaperCheck name="emc_jeopardy" label="Jeopardy to the patient health" defaultChecked={checked(i, "emc_jeopardy")} />
            <br />
            <PaperCheck name="emc_impairment" label="Impairment to bodily functions" defaultChecked={checked(i, "emc_impairment")} />
            <br />
            <PaperCheck name="emc_dysfunction" label="Dysfunction of any bodily organ or part" defaultChecked={checked(i, "emc_dysfunction")} />
          </div>

          <SectionTitle>Physical Orders:</SectionTitle>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <PaperInline label="X-Ray: Cervical" name="xray_cervical_views" defaultValue={str(i, "xray_cervical_views")} inputClassName="max-w-[80px]" />
            <PaperInline label="Thoracic" name="xray_thoracic_views" defaultValue={str(i, "xray_thoracic_views")} inputClassName="max-w-[80px]" />
            <PaperInline label="Lumbar" name="xray_lumbar_views" defaultValue={str(i, "xray_lumbar_views")} inputClassName="max-w-[80px]" />
            <PaperInline label="Other:" name="xray_other" defaultValue={str(i, "xray_other")} />
          </div>
          <p className="m-0 text-[10px] text-black/60">views</p>
          <Row>
            <span className="text-[11px] font-semibold">Medication:</span>
          </Row>
          <div className="space-y-1">
            <PaperCheck name="med_ibuprofen" label="Ibuprofen 400 mg/800 mg, 1 tablet every 8 h PRN pain" defaultChecked={checked(i, "med_ibuprofen")} />
            <br />
            <PaperCheck name="med_cyclobenzaprine" label="Cyclobenzaprine 5 mg. 1 tablet P O every 8 h PRN muscle spasm." defaultChecked={checked(i, "med_cyclobenzaprine")} />
          </div>
        </div>
        <div className="h-6" />
      </PaperSheet>

      {/* ---------------------------------------------------------- page 8 */}
      <PaperSheet title="Initial Evaluation — Treatment" page={8} totalPages={T}>
        <div className="space-y-2 px-6 pt-3">
          <SectionTitle>Treatment:</SectionTitle>
          <div className="grid grid-cols-3 gap-x-6 gap-y-1">
            <PaperCheck name="tx_ems" label="EMS" defaultChecked={checked(i, "tx_ems")} />
            <PaperCheck name="tx_hot_pack" label="Hot/Pack" defaultChecked={checked(i, "tx_hot_pack")} />
            <PaperCheck name="tx_estim" label="Electric Stimulation" defaultChecked={checked(i, "tx_estim")} />
            <PaperCheck name="tx_traction" label="Traction" defaultChecked={checked(i, "tx_traction")} />
            <PaperCheck name="tx_cryotherapy" label="Cryotherapy" defaultChecked={checked(i, "tx_cryotherapy")} />
            <PaperCheck name="tx_laser" label="Low Lover Laser Therapy" defaultChecked={checked(i, "tx_laser")} />
            <PaperCheck name="tx_us" label="US" defaultChecked={checked(i, "tx_us")} />
            <PaperCheck name="tx_hydrotherapy" label="Hydrotherapy" defaultChecked={checked(i, "tx_hydrotherapy")} />
            <PaperCheck name="tx_trigger_point" label="Trigger Point" defaultChecked={checked(i, "tx_trigger_point")} />
            <PaperCheck name="tx_massage" label="Massage" defaultChecked={checked(i, "tx_massage")} />
            <PaperCheck name="tx_neuro_reed" label="Neuromuscular Re-education" defaultChecked={checked(i, "tx_neuro_reed")} />
            <PaperCheck name="tx_manual_attend" label="Manual Attend" defaultChecked={checked(i, "tx_manual_attend")} />
            <PaperCheck name="tx_ther_exercise" label="Ther. Exercise" defaultChecked={checked(i, "tx_ther_exercise")} />
            <PaperCheck name="tx_contrast_bath" label="Contrast Bath" defaultChecked={checked(i, "tx_contrast_bath")} />
            <PaperCheck name="tx_manual_therapy" label="Manual Therapy" defaultChecked={checked(i, "tx_manual_therapy")} />
            <PaperCheck name="tx_parrafin" label="Parrafin" defaultChecked={checked(i, "tx_parrafin")} />
            <PaperCheck name="tx_cold_pack" label="Cold Pack" defaultChecked={checked(i, "tx_cold_pack")} />
          </div>

          <SectionTitle>Treatment Plan:</SectionTitle>
          <Row>
            <span className="text-[11px]">Therapy:</span>
            <Levels i={i} name="plan_freq" levels={["1", "2", "3", "4", "5"]} />
            <span className="text-[11px]">x/week(s) for</span>
            <Levels i={i} name="plan_weeks" levels={["1", "2", "3", "4", "5"]} />
            <span className="text-[11px]">week(s)</span>
          </Row>
          <Row>
            <span className="text-[11px]">Follow-up Exam in</span>
            <Levels i={i} name="plan_followup_weeks" levels={["1", "2", "3", "4", "5"]} />
            <span className="text-[11px]">week(s)</span>
          </Row>

          <SectionTitle>Recommendation:</SectionTitle>
          <Row>
            <span className="text-[11px]">Treat patient as prescribed. Re. Evaluation will perform in</span>
            <input
              type="text"
              name="reeval_weeks"
              defaultValue={str(i, "reeval_weeks")}
              className="w-[60px] border-0 border-b border-black/50 bg-transparent px-1 py-0.5 text-center text-[11px] focus:border-black focus:outline-none"
            />
            <span className="text-[11px]">weeks.</span>
          </Row>
          <p className="m-0 text-[11px]">
            The patient was advised palliative care at home as much as possible until
            imorovement reach.
          </p>

          <SectionTitle>Comments:</SectionTitle>
          <textarea
            name="comments"
            rows={3}
            defaultValue={str(i, "comments")}
            className="w-full resize-y border-0 border-b border-black/50 bg-transparent px-1 py-1 text-[12px] focus:border-black focus:outline-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 21px, rgba(0,0,0,0.12) 21px, rgba(0,0,0,0.12) 22px)",
              lineHeight: "22px",
            }}
          />
          <Row>
            <PaperCheck name="rec_ortho" label="Orthopedic consultation" defaultChecked={checked(i, "rec_ortho")} />
            <PaperCheck name="rec_neuro" label="Neurologic Consultation" defaultChecked={checked(i, "rec_neuro")} />
            <PaperCheck name="rec_mri" label="MRI" defaultChecked={checked(i, "rec_mri")} />
          </Row>
          <Row className="pt-1">
            <PaperCheck
              name="certify"
              label="I hereby certify that all information provided by me to the clinic/medical provider herein is true and accurate."
              defaultChecked={checked(i, "certify")}
            />
          </Row>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-3">
              <SignaturePad
                name="physician_signature"
                label="Physician Signature"
                initialDataUrl={str(i, "physician_signature") || null}
                heightPx={110}
              />
              <div className="grid grid-cols-2 gap-3">
                <PaperInline label="Physician Name" name="physician_name" defaultValue={str(i, "physician_name")} />
                <PaperInline label="Date" name="physician_date" type="date" defaultValue={str(i, "physician_date") || today} />
              </div>
            </div>
            <div className="space-y-3">
              <SignaturePad
                name="patient_signature"
                label="Patient Signature"
                initialDataUrl={str(i, "patient_signature") || null}
                heightPx={110}
              />
              <div className="grid grid-cols-2 gap-3">
                <PaperInline label="Patient Name" name="patient_name_sig" defaultValue={str(i, "patient_name_sig") || patientName} />
                <PaperInline label="Date" name="patient_date" type="date" defaultValue={str(i, "patient_date") || today} />
              </div>
            </div>
          </div>
        </div>
        <div className="h-8" />
      </PaperSheet>
    </>
  );
}
