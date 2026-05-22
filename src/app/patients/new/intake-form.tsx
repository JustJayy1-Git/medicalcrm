"use client";

import Link from "next/link";
import { createPatient } from "./actions";

type Provider = { id: string; full_name: string; credentials: string | null };

const ETHNICITY_OPTIONS = [
  { value: "", label: "—" },
  { value: "hispanic_latino", label: "Hispanic or Latino" },
  { value: "not_hispanic_latino", label: "Not Hispanic or Latino" },
  { value: "declined", label: "Declined to specify" },
  { value: "unknown", label: "Unknown" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "ht", label: "Haitian Creole" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
  { value: "other", label: "Other" },
];

const BIRTH_SEX = [
  { value: "", label: "—" },
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "X", label: "Unknown" },
];

const GENDER_IDENTITY = [
  { value: "", label: "—" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "transgender_male", label: "Transgender Male" },
  { value: "transgender_female", label: "Transgender Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "declined", label: "Choose not to disclose" },
];

const SEXUAL_ORIENTATION = [
  { value: "", label: "—" },
  { value: "straight", label: "Straight" },
  { value: "lesbian_gay", label: "Lesbian / Gay" },
  { value: "bisexual", label: "Bisexual" },
  { value: "other", label: "Other" },
  { value: "declined", label: "Choose not to disclose" },
  { value: "unknown", label: "Unknown" },
];

const ENTITY_TYPE = [
  { value: "", label: "—" },
  { value: "person", label: "Person" },
  { value: "non_person", label: "Non-Person Entity" },
];

const EMPLOYMENT_STATUS = [
  { value: "", label: "—" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "self_employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
  { value: "not_applicable", label: "N/A" },
];

const AR_STATUS = [
  { value: "", label: "—" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "collections", label: "Collections" },
  { value: "write_off", label: "Write-off" },
];

export function IntakeForm({
  providers,
  errorMsg,
}: {
  providers: Provider[];
  errorMsg?: string | null;
}) {
  return (
    <form action={createPatient} className="space-y-3">
      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Top metadata row (always visible — applies to whole patient) */}
      <section className="p-3 rounded-lg bg-white border border-vice-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <Field
            label="Chart number"
            name="chart_number"
            placeholder="Auto-assigned if blank"
          />
          <Select label="A/R status" name="ar_status" options={AR_STATUS} />
          <div className="pt-5">
            <Checkbox label="Inactive" name="is_inactive" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <NameAddressTab providers={providers} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
        <Link
          href="/patients"
          className="px-4 py-2 text-sm border border-neutral-700 text-neutral-200 rounded-md hover:bg-neutral-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-neutral-950 font-semibold rounded-md hover:brightness-110"
        >
          Save patient
        </button>
      </div>
    </form>
  );
}

function NameAddressTab({ providers }: { providers: Provider[] }) {
  return (
    <>
      {/* Patient */}
      <SectionCard title="Patient">
        <Field label="Last name *" name="last_name" required span={2} />
        <Field label="Suffix" name="suffix" />
        <Field label="First name *" name="first_name" required span={2} />
        <Field label="Middle name" name="middle_name" />
        <Field label="Preferred / nickname" name="preferred_name" span={3} />
        <Field label="Date of birth" name="date_of_birth" type="date" />
        <Field label="Social Security" name="ssn_full" placeholder="123-45-6789" />
        <Select
          label="Sex"
          name="sex"
          options={[
            { value: "", label: "—" },
            { value: "M", label: "Male" },
            { value: "F", label: "Female" },
            { value: "X", label: "Other / unknown" },
          ]}
        />
        <Select
          label="Language"
          name="language"
          options={LANGUAGE_OPTIONS}
          defaultValue="en"
        />
      </SectionCard>

      {/* Right column: address + assignments */}
      <div className="space-y-3">
        <SectionCard title="Address & phones">
          <Field label="Street" name="address_line1" span={3} />
          <Field label="Street line 2" name="address_line2" span={3} />
          <Field label="City" name="city" />
          <Field label="State" name="state" maxLength={2} />
          <Field label="Zip" name="zip" />
          <Field label="Country" name="country" defaultValue="USA" />
          <Field label="Email" name="email" type="email" span={3} />
          <Field label="Home" name="phone_home" type="tel" />
          <Field label="Work" name="phone_work" type="tel" />
          <Field label="Cell" name="phone_cell" type="tel" />
          <Field label="Fax" name="phone_fax" type="tel" />
          <Field label="Other" name="phone_other" type="tel" />
        </SectionCard>

        <SectionCard title="Assignments">
          <div className="col-span-3">
            <label className="block text-[11px] font-medium text-eggplant-700 mb-0.5">
              Assigned provider
            </label>
            <select
              name="assigned_provider_id"
              defaultValue=""
              className="w-full px-2 py-1 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
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
              <p className="text-[10px] text-vice-muted mt-0.5">
                No providers yet. Add some under Lists → Providers.
              </p>
            )}
          </div>
          <div className="pt-5">
            <Checkbox label="Signature on file" name="signature_on_file" />
          </div>
          <Field label="Signature date" name="signature_date" type="date" span={2} />
        </SectionCard>
      </div>
    </>
  );
}



// =======================
// Building blocks
// =======================

function SectionCard({
  title,
  children,
  cols = 3,
}: {
  title: string;
  children: React.ReactNode;
  cols?: 1 | 3;
}) {
  return (
    <section className="p-3 rounded-lg bg-white border border-vice-border shadow-sm">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-2">
        {title}
      </h2>
      <div className={`grid grid-cols-${cols === 1 ? "1" : "3"} gap-2`}>
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  span = 1,
  hint,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  span?: 1 | 2 | 3;
  hint?: string;
  [key: string]: unknown;
}) {
  const spanClass =
    span === 3 ? "col-span-3" : span === 2 ? "col-span-2" : "col-span-1";
  return (
    <div className={spanClass}>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-0.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-2 py-1 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
        {...rest}
      />
      {hint && <p className="text-[10px] text-vice-muted mt-0.5">{hint}</p>}
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
      <label className="block text-[11px] font-medium text-eggplant-700 mb-0.5">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full px-2 py-1 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
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

function Checkbox({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-center gap-2 text-xs text-eggplant-800 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        className="rounded border-vice-muted bg-white text-neon-mint focus:ring-neon-mint/40"
      />
      {label}
    </label>
  );
}
