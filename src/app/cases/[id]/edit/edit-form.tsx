"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { updateCase } from "./actions";
import { CodePicker } from "@/components/code-picker";
import {
  AttachmentsPanel,
  type Attachment,
} from "@/components/attachments-panel";

type Carrier = { id: string; name: string };
type Attorney = { id: string; attorney_name: string; firm_name: string | null };
type Provider = { id: string; full_name: string; credentials: string | null };
type Facility = { id: string; name: string };

// Single payload shape covering every field the form touches.
// Using `unknown` everywhere keeps it safe even though the DB returns mixed types.
export type CaseRow = Record<string, unknown> & { id: string };

const TYPE_LABEL: Record<string, string> = {
  mva: "MVA",
  slip_fall: "S/F",
  workers_comp: "WC",
  sports: "SPT",
  other: "CASE",
};

function autoName(type: string, doa: string): string {
  if (!doa) return "";
  const [y, m, d] = doa.split("-");
  if (!y || !m || !d) return "";
  const label = TYPE_LABEL[type] ?? "CASE";
  return `${label} ${m}/${d}/${y}`;
}

const PAIN_LOCATIONS = [
  { value: "head", label: "Head" },
  { value: "neck", label: "Neck / cervical" },
  { value: "mid_back", label: "Mid back / thoracic" },
  { value: "lower_back", label: "Lower back / lumbar" },
  { value: "left_shoulder", label: "L shoulder" },
  { value: "right_shoulder", label: "R shoulder" },
  { value: "left_arm", label: "L arm" },
  { value: "right_arm", label: "R arm" },
  { value: "left_hip", label: "L hip" },
  { value: "right_hip", label: "R hip" },
  { value: "left_knee", label: "L knee" },
  { value: "right_knee", label: "R knee" },
  { value: "left_ankle", label: "L ankle" },
  { value: "right_ankle", label: "R ankle" },
  { value: "chest", label: "Chest" },
  { value: "abdomen", label: "Abdomen" },
  { value: "other", label: "Other" },
];

type Tab = "providers" | "attorney" | "condition" | "diagnosis" | "policy" | "auth";

const v = (c: CaseRow, k: string): string => {
  const val = c[k];
  return val === null || val === undefined ? "" : String(val);
};
const vb = (c: CaseRow, k: string): boolean => c[k] === true;
const vYN = (c: CaseRow, k: string): string =>
  c[k] === true ? "yes" : c[k] === false ? "no" : "";

export function EditCaseForm({
  c,
  patientId,
  patientName,
  carriers,
  attorneys,
  providers,
  facilities,
  attachments,
  errorMsg,
}: {
  c: CaseRow;
  patientId: string;
  patientName: string;
  carriers: Carrier[];
  attorneys: Attorney[];
  providers: Provider[];
  facilities: Facility[];
  attachments: Attachment[];
  errorMsg?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("providers");
  const [caseType, setCaseType] = useState(v(c, "case_type") || "mva");
  const [doa, setDoa] = useState(v(c, "date_of_injury"));
  const [description, setDescription] = useState(v(c, "description"));
  const userEditedDesc = useRef(true); // assume user-set on edit

  useEffect(() => {
    if (!userEditedDesc.current) {
      setDescription(autoName(caseType, doa));
    }
  }, [caseType, doa]);

  const diagnosisCodes = Array.isArray(c.diagnosis_codes)
    ? (c.diagnosis_codes as string[])
    : [];
  const painLocations = Array.isArray(c.pain_locations)
    ? (c.pain_locations as string[])
    : [];

  return (
    <form action={updateCase} className="space-y-3">
      <input type="hidden" name="id" value={c.id} />

      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Header */}
      <section className="p-3 rounded-lg bg-white border border-stone-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">
              Type
            </label>
            <select
              name="case_type"
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            >
              <option value="mva">Motor vehicle accident</option>
              <option value="slip_fall">Slip &amp; fall</option>
              <option value="workers_comp">Workers&apos; comp</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">
              Date of accident
            </label>
            <input
              type="date"
              name="date_of_injury"
              value={doa}
              onChange={(e) => setDoa(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
          </div>
          <Select
            label="Status"
            name="status"
            defaultValue={v(c, "status") || "open"}
            options={[
              { value: "open", label: "Open" },
              { value: "active", label: "Active" },
              { value: "on_hold", label: "On hold" },
              { value: "settled", label: "Settled" },
              { value: "closed", label: "Closed" },
              { value: "denied", label: "Denied" },
            ]}
          />
          <Select
            label="Billing method"
            name="billing_method"
            defaultValue={v(c, "billing_method") || "insurance"}
            options={[
              { value: "insurance", label: "Insurance (CMS-1500)" },
              { value: "lop", label: "LOP (attorney lien)" },
              { value: "cash", label: "Cash" },
              { value: "mixed", label: "Mixed" },
            ]}
          />
        </div>
        <div className="mt-3">
          <label className="block text-[11px] font-medium text-stone-600 mb-1">
            Case name
          </label>
          <input
            type="text"
            name="description"
            value={description}
            onChange={(e) => {
              userEditedDesc.current = true;
              setDescription(e.target.value);
            }}
            className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-stone-200 overflow-x-auto">
        {(
          [
            ["providers", "Providers"],
            ["diagnosis", "Diagnosis"],
            ["attorney", "Attorney"],
            ["condition", "Condition"],
            ["policy", "Policy"],
            ["auth", "Authorization"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "px-5 py-2 text-sm font-medium transition-colors -mb-px whitespace-nowrap",
              tab === t
                ? "text-amber-800 border-b-2 border-amber-600"
                : "text-stone-500 border-b-2 border-transparent hover:text-stone-900",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {tab === "providers" && (
          <ProvidersTab c={c} providers={providers} facilities={facilities} />
        )}
        {tab === "attorney" && <AttorneyTab c={c} attorneys={attorneys} />}
        {tab === "condition" && <ConditionTab c={c} painLocations={painLocations} />}
        {tab === "diagnosis" && <DiagnosisTab codes={diagnosisCodes} />}
        {tab === "policy" && (
          <PolicyTab
            c={c}
            carriers={carriers}
            caseId={c.id}
            patientId={patientId}
            attachments={attachments}
          />
        )}
        {tab === "auth" && <AuthTab c={c} />}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
        <Link
          href={`/cases/${c.id}`}
          className="px-4 py-2 text-sm border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-gradient-to-b from-amber-400 to-amber-600 text-stone-900 font-semibold rounded-md hover:from-amber-300 hover:to-amber-500 shadow-sm"
        >
          Save changes
        </button>
      </div>

      <p className="text-[11px] text-stone-400 text-right">
        Linked patient: {patientName} ·{" "}
        <Link
          href={`/patients/${patientId}`}
          className="underline hover:text-stone-700"
        >
          open patient
        </Link>
      </p>
    </form>
  );
}

// ============================================
// Tabs
// ============================================
function ProvidersTab({
  c,
  providers,
  facilities,
}: {
  c: CaseRow;
  providers: Provider[];
  facilities: Facility[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="Providers & referral">
        <ProviderSelect
          label="Assigned provider"
          name="assigned_provider_id"
          providers={providers}
          defaultValue={v(c, "assigned_provider_id")}
        />
        <ProviderSelect
          label="Referring provider"
          name="referring_provider_id"
          providers={providers}
          defaultValue={v(c, "referring_provider_id")}
        />
        <ProviderSelect
          label="Supervising provider"
          name="supervising_provider_id"
          providers={providers}
          defaultValue={v(c, "supervising_provider_id")}
        />
        <Field label="Referred by" name="referral_source" defaultValue={v(c, "referral_source")} />
        <SelectFromList
          label="Facility"
          name="facility_id"
          defaultValue={v(c, "facility_id")}
          options={facilities.map((f) => ({ value: f.id, label: f.name }))}
        />
      </Card>
    </div>
  );
}

function AttorneyTab({
  c,
  attorneys,
}: {
  c: CaseRow;
  attorneys: Attorney[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="Attorney (LOP)">
        <SelectFromList
          label="Attorney"
          name="attorney_id"
          defaultValue={v(c, "attorney_id")}
          options={attorneys.map((a) => ({
            value: a.id,
            label: a.firm_name
              ? `${a.attorney_name} (${a.firm_name})`
              : a.attorney_name,
          }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="LOP signed" name="lop_signed" defaultChecked={vb(c, "lop_signed")} />
          <Field label="LOP signed date" name="lop_signed_date" type="date" defaultValue={v(c, "lop_signed_date")} />
        </div>
        <p className="text-[11px] text-stone-500">
          Add or manage attorneys under Lists → Attorneys.
        </p>
      </Card>
    </div>
  );
}

function ConditionTab({
  c,
  painLocations,
}: {
  c: CaseRow;
  painLocations: string[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="Accident details">
        <Field label="Initial treatment date" name="initial_treatment_date" type="date" defaultValue={v(c, "initial_treatment_date")} />
        <Field label="Illness / injury date" name="illness_date" type="date" defaultValue={v(c, "illness_date")} />
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="Same / similar symptoms" name="same_or_similar_symptoms" defaultChecked={vb(c, "same_or_similar_symptoms")} />
          <Field label="Similar symptoms date" name="similar_symptoms_date" type="date" defaultValue={v(c, "similar_symptoms_date")} />
        </div>
        <TextArea label="How did it happen?" name="how_it_happened" rows={3} defaultValue={v(c, "how_it_happened")} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="At fault" name="fault" defaultValue={v(c, "fault")} options={[
            { value: "", label: "—" },
            { value: "other_driver", label: "Other party" },
            { value: "patient", label: "Patient" },
            { value: "shared", label: "Shared" },
            { value: "unclear", label: "Unclear / disputed" },
          ]} />
          <Field label="State" name="accident_state" maxLength={2} defaultValue={v(c, "accident_state")} />
        </div>
        <Field label="Nature of accident" name="accident_nature" defaultValue={v(c, "accident_nature")} />
        <Field label="Police report #" name="police_report_num" defaultValue={v(c, "police_report_num")} />
        <Field label="Fault notes" name="fault_notes" defaultValue={v(c, "fault_notes")} />
      </Card>

      <Card title="Scene & ER">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Airbag deployed" name="airbag_deployed" defaultValue={vYN(c, "airbag_deployed")} options={[
            { value: "", label: "—" },
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]} />
          <Select label="Seatbelt worn" name="seatbelt_worn" defaultValue={vYN(c, "seatbelt_worn")} options={[
            { value: "", label: "—" },
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="Loss of consciousness" name="loss_consciousness" defaultChecked={vb(c, "loss_consciousness")} />
          <Checkbox label="Ambulance to scene" name="ambulance" defaultChecked={vb(c, "ambulance")} />
        </div>
        <Checkbox label="ER visit" name="er_visit" defaultChecked={vb(c, "er_visit")} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="ER facility" name="er_visit_facility" defaultValue={v(c, "er_visit_facility")} />
          <Field label="ER date" name="er_visit_date" type="date" defaultValue={v(c, "er_visit_date")} />
        </div>
      </Card>

      <Card title="Pain & symptoms">
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1">
            Pain locations
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PAIN_LOCATIONS.map((p) => (
              <Checkbox
                key={p.value}
                label={p.label}
                name="pain_locations"
                value={p.value}
                defaultChecked={painLocations.includes(p.value)}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">
              Pain level (0–10)
            </label>
            <select
              name="pain_level"
              defaultValue={v(c, "pain_level")}
              className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            >
              <option value="">—</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>
        <TextArea label="Pain notes" name="pain_notes" rows={2} defaultValue={v(c, "pain_notes")} />
      </Card>

      <Card title="Work & disability dates">
        <DateRange label="Unable to work" name="unable_to_work" fromVal={v(c, "unable_to_work_from")} toVal={v(c, "unable_to_work_to")} />
        <DateRange label="Total disability" name="total_disability" fromVal={v(c, "total_disability_from")} toVal={v(c, "total_disability_to")} />
        <DateRange label="Partial disability" name="partial_disability" fromVal={v(c, "partial_disability_from")} toVal={v(c, "partial_disability_to")} />
        <DateRange label="Hospitalization" name="hospitalization" fromVal={v(c, "hospitalization_from")} toVal={v(c, "hospitalization_to")} />
      </Card>
    </div>
  );
}

function DiagnosisTab({ codes }: { codes: string[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="ICD-10 diagnosis codes">
        <p className="text-xs text-stone-500">
          Search by code (e.g. <span className="font-mono">S13.4</span>) or
          keyword (e.g. <span className="italic">lumbar sprain</span>). Click
          🔍 or start typing.
        </p>
        {Array.from({ length: 8 }, (_, i) => (
          <CodePicker
            key={i}
            label={`Diagnosis ${i + 1}`}
            name="diagnosis_codes"
            defaultValue={codes[i] ?? ""}
            endpoint="/api/codes/icd"
          />
        ))}
      </Card>
    </div>
  );
}

function PolicyTab({
  c,
  carriers,
  caseId,
  patientId,
  attachments,
}: {
  c: CaseRow;
  carriers: Carrier[];
  caseId: string;
  patientId: string;
  attachments: Attachment[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Card title="Primary insurance">
        <SelectFromList label="Carrier" name="primary_carrier_id" defaultValue={v(c, "primary_carrier_id")} options={carriers.map((cr) => ({ value: cr.id, label: cr.name }))} />
        <Field label="Claim number" name="primary_claim_number" defaultValue={v(c, "primary_claim_number")} />
        <Field label="Policy number" name="primary_policy_number" defaultValue={v(c, "primary_policy_number")} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Group number" name="primary_group_number" defaultValue={v(c, "primary_group_number")} />
          <Field label="Group name" name="primary_group_name" defaultValue={v(c, "primary_group_name")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Policy start" name="primary_policy_start" type="date" defaultValue={v(c, "primary_policy_start")} />
          <Field label="Policy end" name="primary_policy_end" type="date" defaultValue={v(c, "primary_policy_end")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Annual deductible" name="deductible_amount" type="number" step="0.01" defaultValue={v(c, "deductible_amount")} />
          <Field label="Copayment" name="copay_amount" type="number" step="0.01" defaultValue={v(c, "copay_amount")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="Accept assignment" name="accept_assignment" defaultChecked={vb(c, "accept_assignment")} />
          <Checkbox label="Deductible met" name="deductible_met" defaultChecked={vb(c, "deductible_met")} />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-200">
          <Field label="Adjuster name" name="primary_adjuster_name" defaultValue={v(c, "primary_adjuster_name")} />
          <Field label="Adjuster phone" name="primary_adjuster_phone" type="tel" defaultValue={v(c, "primary_adjuster_phone")} />
        </div>
        <Field label="Adjuster email" name="primary_adjuster_email" type="email" defaultValue={v(c, "primary_adjuster_email")} />
      </Card>

      <AttachmentsPanel
        caseId={caseId}
        patientId={patientId}
        initial={attachments}
      />
    </div>
  );
}

function AuthTab({ c }: { c: CaseRow }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="Authorization">
        <Field label="Authorization number" name="authorization_number" defaultValue={v(c, "authorization_number")} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Authorized # of visits" name="authorized_visits" type="number" defaultValue={v(c, "authorized_visits")} />
          <Field label="Treatment authorized through" name="authorized_through" type="date" defaultValue={v(c, "authorized_through")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Last visit date" name="last_visit_date" type="date" defaultValue={v(c, "last_visit_date")} />
          <Field label="Last visit number" name="last_visit_number" type="number" defaultValue={v(c, "last_visit_number")} />
        </div>
        <Field label="Date of first visit" name="date_of_first_visit" type="date" defaultValue={v(c, "date_of_first_visit")} />
      </Card>
    </div>
  );
}

// ============================================
// Building blocks
// ============================================
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  [key: string]: unknown;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-stone-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500"
        {...rest}
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  rows = 3,
  defaultValue = "",
}: {
  label: string;
  name: string;
  rows?: number;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-stone-600 mb-1">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue = "",
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-stone-600 mb-1">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function SelectFromList({
  label,
  name,
  options,
  defaultValue = "",
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-stone-600 mb-1">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
      >
        <option value="">— None —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function ProviderSelect({
  label,
  name,
  providers,
  defaultValue = "",
}: {
  label: string;
  name: string;
  providers: Provider[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-stone-600 mb-1">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
      >
        <option value="">— None —</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}{p.credentials ? `, ${p.credentials}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({
  label,
  name,
  value,
  defaultChecked,
}: {
  label: string;
  name: string;
  value?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="rounded border-stone-400 bg-white text-amber-600 focus:ring-amber-500/40"
      />
      {label}
    </label>
  );
}

function DateRange({
  label,
  name,
  fromVal,
  toVal,
}: {
  label: string;
  name: string;
  fromVal: string;
  toVal: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] items-end gap-2">
      <div className="text-[11px] font-medium text-stone-600">{label}</div>
      <div>
        <label className="block text-[10px] text-stone-500 mb-0.5">From</label>
        <input
          type="date"
          name={`${name}_from`}
          defaultValue={fromVal}
          className="w-full px-2 py-1 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
        />
      </div>
      <div>
        <label className="block text-[10px] text-stone-500 mb-0.5">To</label>
        <input
          type="date"
          name={`${name}_to`}
          defaultValue={toVal}
          className="w-full px-2 py-1 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
        />
      </div>
    </div>
  );
}
