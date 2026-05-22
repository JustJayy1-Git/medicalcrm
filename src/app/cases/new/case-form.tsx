"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createCase } from "./actions";
import { CodePicker } from "@/components/code-picker";
import { AttorneyPicker } from "@/components/attorney-picker";
import { CarrierPicker } from "@/components/carrier-picker";
import type { AttorneyPicker as AttorneyRecord } from "@/lib/attorney";
import type { InsuranceCarrierPicker } from "@/lib/insurance-carrier";

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

type Carrier = InsuranceCarrierPicker;
type Attorney = AttorneyRecord;
type Provider = {
  id: string;
  full_name: string;
  credentials: string | null;
};
type Facility = { id: string; name: string };

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

export function CaseForm({
  patientId,
  patientName,
  carriers,
  attorneys,
  providers,
  facilities,
  errorMsg,
}: {
  patientId: string;
  patientName: string;
  carriers: Carrier[];
  attorneys: Attorney[];
  providers: Provider[];
  facilities: Facility[];
  errorMsg?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("providers");
  const [caseType, setCaseType] = useState("mva");
  const [doa, setDoa] = useState("");
  const [description, setDescription] = useState("");
  const userEditedDesc = useRef(false);

  // Live-sync auto name when the user hasn't manually edited it
  useEffect(() => {
    if (!userEditedDesc.current) {
      setDescription(autoName(caseType, doa));
    }
  }, [caseType, doa]);

  return (
    <form action={createCase} className="space-y-3">
      <input type="hidden" name="patient_id" value={patientId} />

      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Always-visible header card */}
      <section className="p-3 rounded-lg bg-white border border-vice-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
              Type
            </label>
            <select
              name="case_type"
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
            >
              <option value="mva">Motor vehicle accident</option>
              <option value="slip_fall">Slip &amp; fall</option>
              <option value="workers_comp">Workers&apos; comp</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
              Date of accident
            </label>
            <input
              type="date"
              name="date_of_injury"
              value={doa}
              onChange={(e) => setDoa(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
            />
          </div>
          <Select
            label="Status"
            name="status"
            defaultValue="open"
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
            defaultValue="insurance"
            options={[
              { value: "insurance", label: "Insurance (CMS-1500)" },
              { value: "lop", label: "LOP (attorney lien)" },
              { value: "cash", label: "Cash" },
              { value: "mixed", label: "Mixed" },
            ]}
          />
        </div>
        <div className="mt-3">
          <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
            Case name{" "}
            <span className="text-vice-muted">(auto from type + date — you can override)</span>
          </label>
          <input
            type="text"
            name="description"
            value={description}
            onChange={(e) => {
              userEditedDesc.current = true;
              setDescription(e.target.value);
            }}
            placeholder="e.g. MVA 03/15/2026"
            className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
          />
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-vice-border overflow-x-auto">
        <TabBtn active={tab === "providers"} onClick={() => setTab("providers")}>
          Providers
        </TabBtn>
        <TabBtn active={tab === "diagnosis"} onClick={() => setTab("diagnosis")}>
          Diagnosis
        </TabBtn>
        <TabBtn active={tab === "attorney"} onClick={() => setTab("attorney")}>
          Attorney
        </TabBtn>
        <TabBtn active={tab === "condition"} onClick={() => setTab("condition")}>
          Condition
        </TabBtn>
        <TabBtn active={tab === "policy"} onClick={() => setTab("policy")}>
          Policy
        </TabBtn>
        <TabBtn active={tab === "auth"} onClick={() => setTab("auth")}>
          Authorization
        </TabBtn>
      </div>

      <div>
        {tab === "providers" && (
          <ProvidersTab providers={providers} facilities={facilities} />
        )}
        {tab === "attorney" && <AttorneyTab attorneys={attorneys} />}
        {tab === "condition" && <ConditionTab />}
        {tab === "diagnosis" && <DiagnosisTab />}
        {tab === "policy" && <PolicyTab carriers={carriers} />}
        {tab === "auth" && <AuthTab />}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-vice-border">
        <Link
          href={`/patients/${patientId}`}
          className="px-4 py-2 text-sm border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
        >
          Cancel — back to {patientName}
        </Link>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm"
        >
          Save case
        </button>
      </div>
    </form>
  );
}

// ==========================================================
// Tab contents
// ==========================================================

function ProvidersTab({
  providers,
  facilities,
}: {
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
        />
        <ProviderSelect
          label="Referring provider"
          name="referring_provider_id"
          providers={providers}
        />
        <ProviderSelect
          label="Supervising provider"
          name="supervising_provider_id"
          providers={providers}
        />
        <Field label="Referred by" name="referral_source" />
        <SelectFromList
          label="Facility"
          name="facility_id"
          options={facilities.map((f) => ({ value: f.id, label: f.name }))}
          emptyHint="No facilities yet — add some under Lists → Facilities."
        />
      </Card>
    </div>
  );
}

function AttorneyTab({ attorneys }: { attorneys: Attorney[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="Attorney (LOP)">
        <AttorneyPicker
          label="Attorney"
          name="attorney_id"
          attorneys={attorneys}
        />
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="LOP signed" name="lop_signed" />
          <Field label="LOP signed date" name="lop_signed_date" type="date" />
        </div>
      </Card>
    </div>
  );
}

function ConditionTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="Accident details">
        <p className="text-[11px] text-vice-muted">
          Date of accident is set in the header at the top. The fields below
          are additional condition dates.
        </p>
        <Field
          label="Initial treatment date"
          name="initial_treatment_date"
          type="date"
        />
        <Field label="Illness / injury date" name="illness_date" type="date" />
        <div className="grid grid-cols-2 gap-3">
          <Checkbox
            label="Same / similar symptoms before"
            name="same_or_similar_symptoms"
          />
          <Field
            label="Similar symptoms date"
            name="similar_symptoms_date"
            type="date"
          />
        </div>
        <TextArea
          label="How did the accident happen?"
          name="how_it_happened"
          rows={3}
          placeholder="Rear-ended at a stoplight…"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="At fault"
            name="fault"
            options={[
              { value: "", label: "—" },
              { value: "other_driver", label: "Other party" },
              { value: "patient", label: "Patient" },
              { value: "shared", label: "Shared" },
              { value: "unclear", label: "Unclear / disputed" },
            ]}
          />
          <Field label="State (accident)" name="accident_state" maxLength={2} />
        </div>
        <Field label="Nature of accident" name="accident_nature" />
        <Field label="Police report #" name="police_report_num" />
        <Field label="Fault notes" name="fault_notes" />
      </Card>

      <Card title="Scene & ER">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Airbag deployed"
            name="airbag_deployed"
            options={[
              { value: "", label: "—" },
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          <Select
            label="Seatbelt worn"
            name="seatbelt_worn"
            options={[
              { value: "", label: "—" },
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="Loss of consciousness" name="loss_consciousness" />
          <Checkbox label="Ambulance to scene" name="ambulance" />
        </div>
        <Checkbox label="ER visit" name="er_visit" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="ER facility" name="er_visit_facility" />
          <Field label="ER date" name="er_visit_date" type="date" />
        </div>
      </Card>

      <Card title="Pain & symptoms">
        <div>
          <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
            Pain locations
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PAIN_LOCATIONS.map((p) => (
              <Checkbox
                key={p.value}
                label={p.label}
                name="pain_locations"
                value={p.value}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
              Pain level (0–10)
            </label>
            <select
              name="pain_level"
              defaultValue=""
              className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
            >
              <option value="">—</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TextArea
          label="Pain notes"
          name="pain_notes"
          rows={2}
          placeholder="Sharp pain in lower back, worse with movement…"
        />
      </Card>

      <Card title="Work & disability dates">
        <DateRange label="Unable to work" name="unable_to_work" />
        <DateRange label="Total disability" name="total_disability" />
        <DateRange label="Partial disability" name="partial_disability" />
        <DateRange label="Hospitalization" name="hospitalization" />
      </Card>
    </div>
  );
}

function DiagnosisTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="ICD-10 diagnosis codes">
        <p className="text-xs text-vice-muted">
          Search by code (e.g. <span className="font-mono">S13.4</span>) or
          keyword (e.g. <span className="italic">lumbar sprain</span>). Click
          🔍 or start typing.
        </p>
        {Array.from({ length: 8 }, (_, i) => (
          <CodePicker
            key={i}
            label={`Diagnosis ${i + 1}`}
            name="diagnosis_codes"
            endpoint="/api/codes/icd"
          />
        ))}
      </Card>
    </div>
  );
}

function PolicyTab({ carriers }: { carriers: Carrier[] }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Card title="Primary insurance">
        <CarrierPicker
          label="Carrier"
          name="primary_carrier_id"
          carriers={carriers}
        />
        <Field label="Claim number" name="primary_claim_number" />
        <Field label="Policy number" name="primary_policy_number" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Group number" name="primary_group_number" />
          <Field label="Group name" name="primary_group_name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Policy start"
            name="primary_policy_start"
            type="date"
          />
          <Field label="Policy end" name="primary_policy_end" type="date" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Field
            label="Annual deductible"
            name="deductible_amount"
            type="number"
            step="0.01"
          />
          <Field
            label="Copayment"
            name="copay_amount"
            type="number"
            step="0.01"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label="Accept assignment" name="accept_assignment" defaultChecked />
          <Checkbox label="Deductible met" name="deductible_met" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-vice-border">
          <Field label="Adjuster name" name="primary_adjuster_name" />
          <Field
            label="Adjuster phone"
            name="primary_adjuster_phone"
            type="tel"
          />
        </div>
        <Field
          label="Adjuster email"
          name="primary_adjuster_email"
          type="email"
        />
      </Card>

      <p className="text-xs text-vice-muted">
        Insurance cards and other documents can be uploaded after the case is
        saved (Policy tab → Insurance card &amp; documents).
      </p>
    </div>
  );
}

function AuthTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card title="Authorization">
        <Field label="Authorization number" name="authorization_number" />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Authorized # of visits"
            name="authorized_visits"
            type="number"
          />
          <Field
            label="Treatment authorized through"
            name="authorized_through"
            type="date"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Last visit date"
            name="last_visit_date"
            type="date"
          />
          <Field
            label="Last visit number"
            name="last_visit_number"
            type="number"
          />
        </div>
        <Field label="Date of first visit" name="date_of_first_visit" type="date" />
      </Card>
    </div>
  );
}

// ==========================================================
// Reusable bits
// ==========================================================

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-5 py-2 text-sm font-medium transition-colors -mb-px whitespace-nowrap",
        active
          ? "text-eggplant-800 border-b-2 border-neon-mint"
          : "text-vice-muted border-b-2 border-transparent hover:text-eggplant-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
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
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  [key: string]: unknown;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
        {...rest}
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  rows = 3,
  placeholder,
}: {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectFromList({
  label,
  name,
  options,
  emptyHint,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  emptyHint?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue=""
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
      >
        <option value="">— None —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {options.length === 0 && emptyHint && (
        <p className="text-[10px] text-vice-muted mt-1">{emptyHint}</p>
      )}
    </div>
  );
}

function ProviderSelect({
  label,
  name,
  providers,
}: {
  label: string;
  name: string;
  providers: Provider[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue=""
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
      >
        <option value="">— None —</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
            {p.credentials ? `, ${p.credentials}` : ""}
          </option>
        ))}
      </select>
      {providers.length === 0 && (
        <p className="text-[10px] text-vice-muted mt-1">
          No providers yet — add under Providers.
        </p>
      )}
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
    <label className="flex items-center gap-2 text-xs text-eggplant-800 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="rounded border-vice-muted bg-white text-neon-mint focus:ring-neon-mint/40"
      />
      {label}
    </label>
  );
}

function DateRange({ label, name }: { label: string; name: string }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] items-end gap-2">
      <div className="text-[11px] font-medium text-eggplant-700">{label}</div>
      <div>
        <label className="block text-[10px] text-vice-muted mb-0.5">From</label>
        <input
          type="date"
          name={`${name}_from`}
          className="w-full px-2 py-1 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
        />
      </div>
      <div>
        <label className="block text-[10px] text-vice-muted mb-0.5">To</label>
        <input
          type="date"
          name={`${name}_to`}
          className="w-full px-2 py-1 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
        />
      </div>
    </div>
  );
}
