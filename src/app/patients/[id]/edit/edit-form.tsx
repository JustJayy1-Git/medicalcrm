"use client";

import Link from "next/link";
import { updatePatient } from "./actions";

type Provider = { id: string; full_name: string; credentials: string | null };

type PatientPayload = {
  id: string;
  chart_number: string | null;
  ar_status: string | null;
  is_inactive: boolean | null;
  last_name: string | null;
  suffix: string | null;
  first_name: string | null;
  middle_name: string | null;
  preferred_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  email: string | null;
  phone_home: string | null;
  phone_work: string | null;
  phone_cell: string | null;
  phone_fax: string | null;
  phone_other: string | null;
  date_of_birth: string | null;
  ssn_full: string | null;
  sex: string | null;
  language: string | null;
  assigned_provider_id: string | null;
  signature_on_file: boolean | null;
  signature_date: string | null;
};

const AR_STATUS = [
  { value: "", label: "—" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "collections", label: "Collections" },
  { value: "write_off", label: "Write-off" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "ht", label: "Haitian Creole" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
  { value: "other", label: "Other" },
];

export function EditPatientForm({
  patient,
  providers,
  errorMsg,
}: {
  patient: PatientPayload;
  providers: Provider[];
  errorMsg?: string | null;
}) {
  return (
    <form action={updatePatient} className="space-y-3">
      <input type="hidden" name="id" value={patient.id} />

      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg === "missing_name"
            ? "First and last name are required."
            : errorMsg}
        </div>
      )}

      {/* Top row */}
      <section className="p-3 rounded-lg bg-white border border-vice-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <Field
            label="Chart number"
            name="chart_number"
            defaultValue={patient.chart_number ?? ""}
          />
          <Select
            label="A/R status"
            name="ar_status"
            options={AR_STATUS}
            defaultValue={patient.ar_status ?? ""}
          />
          <div className="pt-5">
            <Checkbox
              label="Inactive"
              name="is_inactive"
              defaultChecked={patient.is_inactive ?? false}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Patient */}
        <Card title="Patient">
          <div className="grid grid-cols-3 gap-2">
            <Field
              label="Last name *"
              name="last_name"
              required
              span={2}
              defaultValue={patient.last_name ?? ""}
            />
            <Field
              label="Suffix"
              name="suffix"
              defaultValue={patient.suffix ?? ""}
            />
            <Field
              label="First name *"
              name="first_name"
              required
              span={2}
              defaultValue={patient.first_name ?? ""}
            />
            <Field
              label="Middle"
              name="middle_name"
              defaultValue={patient.middle_name ?? ""}
            />
            <Field
              label="Preferred / nickname"
              name="preferred_name"
              span={3}
              defaultValue={patient.preferred_name ?? ""}
            />
            <Field
              label="Date of birth"
              name="date_of_birth"
              type="date"
              defaultValue={patient.date_of_birth ?? ""}
            />
            <Field
              label="Social Security"
              name="ssn_full"
              placeholder="123-45-6789"
              defaultValue={patient.ssn_full ?? ""}
            />
            <Select
              label="Sex"
              name="sex"
              defaultValue={patient.sex ?? ""}
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
              defaultValue={patient.language ?? "en"}
              options={LANGUAGE_OPTIONS}
            />
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-3">
          <Card title="Address & phones">
            <div className="grid grid-cols-3 gap-2">
              <Field
                label="Street"
                name="address_line1"
                span={3}
                defaultValue={patient.address_line1 ?? ""}
              />
              <Field
                label="Street line 2"
                name="address_line2"
                span={3}
                defaultValue={patient.address_line2 ?? ""}
              />
              <Field
                label="City"
                name="city"
                defaultValue={patient.city ?? ""}
              />
              <Field
                label="State"
                name="state"
                maxLength={2}
                defaultValue={patient.state ?? ""}
              />
              <Field
                label="Zip"
                name="zip"
                defaultValue={patient.zip ?? ""}
              />
              <Field
                label="Country"
                name="country"
                defaultValue={patient.country ?? "USA"}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                span={3}
                defaultValue={patient.email ?? ""}
              />
              <Field
                label="Home"
                name="phone_home"
                type="tel"
                defaultValue={patient.phone_home ?? ""}
              />
              <Field
                label="Work"
                name="phone_work"
                type="tel"
                defaultValue={patient.phone_work ?? ""}
              />
              <Field
                label="Cell"
                name="phone_cell"
                type="tel"
                defaultValue={patient.phone_cell ?? ""}
              />
              <Field
                label="Fax"
                name="phone_fax"
                type="tel"
                defaultValue={patient.phone_fax ?? ""}
              />
              <Field
                label="Other"
                name="phone_other"
                type="tel"
                defaultValue={patient.phone_other ?? ""}
              />
            </div>
          </Card>

          <Card title="Assignments">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3">
                <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
                  Assigned provider
                </label>
                <select
                  name="assigned_provider_id"
                  defaultValue={patient.assigned_provider_id ?? ""}
                  className="w-full px-2 py-1 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
                >
                  <option value="">— None —</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                      {p.credentials ? `, ${p.credentials}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-5">
                <Checkbox
                  label="Signature on file"
                  name="signature_on_file"
                  defaultChecked={patient.signature_on_file ?? false}
                />
              </div>
              <Field
                label="Signature date"
                name="signature_date"
                type="date"
                span={2}
                defaultValue={patient.signature_date ?? ""}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-vice-border">
        <Link
          href={`/patients/${patient.id}`}
          className="px-4 py-2 text-sm border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}

// =======================
// Building blocks (mirror intake form)
// =======================
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-3 rounded-lg bg-white border border-vice-border shadow-sm">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  span = 1,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  span?: 1 | 2 | 3;
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
        className="w-full px-2 py-1 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 focus:outline-none focus:ring-1 focus:ring-neon-mint/40"
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

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-eggplant-800 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="rounded border-vice-muted bg-white text-neon-mint focus:ring-neon-mint/40"
      />
      {label}
    </label>
  );
}
