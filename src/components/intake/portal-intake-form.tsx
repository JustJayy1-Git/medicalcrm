"use client";

import { useState } from "react";
import { submitPortalIntake } from "@/app/portal/actions";

const SECTIONS = [
  { id: "identity", label: "1. Your name" },
  { id: "contact", label: "2. Contact" },
  { id: "about", label: "3. About you" },
  { id: "emergency", label: "4. Emergency" },
  { id: "work", label: "5. Work" },
  { id: "finish", label: "6. Finish" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "ht", label: "Haitian Creole" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
  { value: "other", label: "Other" },
];

const ETHNICITY_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "hispanic_latino", label: "Hispanic or Latino" },
  { value: "not_hispanic_latino", label: "Not Hispanic or Latino" },
  { value: "declined", label: "Declined" },
];

const EMPLOYMENT_STATUS = [
  { value: "", label: "—" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "self_employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
];

export function PortalIntakeForm({ errorMsg }: { errorMsg?: string | null }) {
  const [section, setSection] = useState<SectionId>("identity");
  const idx = SECTIONS.findIndex((s) => s.id === section);

  return (
    <form action={submitPortalIntake} className="flex flex-col min-h-0 flex-1">
      <input type="hidden" name="intake_source" value="portal" />

      {errorMsg && (
        <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-base text-red-800">
          {errorMsg === "missing_name"
            ? "Please enter your first and last name before submitting."
            : errorMsg}
        </div>
      )}

      <nav
        className="flex gap-1 overflow-x-auto px-4 py-3 border-b border-neon-pink/20 bg-eggplant-900/5 shrink-0"
        aria-label="Intake sections"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={[
              "shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
              section === s.id
                ? "bg-eggplant-900 text-neon-mint shadow-sm"
                : "bg-white/80 text-eggplant-700 border border-vice-border",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {section === "identity" && (
          <Section title="Your legal name">
            <Field label="Last name" name="last_name" required autoComplete="family-name" />
            <Field label="First name" name="first_name" required autoComplete="given-name" />
            <Field label="Middle name" name="middle_name" autoComplete="additional-name" />
            <Field label="Suffix" name="suffix" placeholder="Jr., III, etc." />
            <Field
              label="Preferred name (optional)"
              name="preferred_name"
              span="full"
            />
            <Field label="Date of birth" name="date_of_birth" type="date" required />
            <Field
              label="Social Security number"
              name="ssn_full"
              autoComplete="off"
              hint="Used for billing and records. Ask front desk if unsure."
            />
          </Section>
        )}

        {section === "contact" && (
          <Section title="Address & phone">
            <Field label="Street address" name="address_line1" span="full" autoComplete="street-address" />
            <Field label="Apt / suite" name="address_line2" span="full" />
            <Field label="City" name="city" autoComplete="address-level2" />
            <Field label="State" name="state" maxLength={2} placeholder="FL" autoComplete="address-level1" />
            <Field label="ZIP" name="zip" autoComplete="postal-code" />
            <Field label="Email" name="email" type="email" span="full" autoComplete="email" />
            <Field label="Cell phone" name="phone_cell" type="tel" autoComplete="tel" />
            <Field label="Home phone" name="phone_home" type="tel" />
            <Field label="Work phone" name="phone_work" type="tel" />
          </Section>
        )}

        {section === "about" && (
          <Section title="About you (optional)">
            <Select label="Preferred language" name="language" options={LANGUAGE_OPTIONS} defaultValue="en" />
            <Select label="Sex" name="sex" options={[
              { value: "", label: "—" },
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
              { value: "X", label: "Other / prefer not to say" },
            ]} />
            <Select label="Ethnicity" name="ethnicity" options={ETHNICITY_OPTIONS} />
            <p className="text-sm text-vice-muted col-span-full">Race (check all that apply)</p>
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Checkbox label="American Indian / Alaska Native" name="race_native_american" />
              <Checkbox label="Asian" name="race_asian" />
              <Checkbox label="Black / African American" name="race_black" />
              <Checkbox label="Native Hawaiian / Pacific Islander" name="race_pacific_islander" />
              <Checkbox label="White" name="race_white" />
              <Checkbox label="Decline to answer" name="race_declined" />
            </div>
          </Section>
        )}

        {section === "emergency" && (
          <Section title="Emergency contact">
            <Field label="Contact name" name="emergency_name" span="full" />
            <Field label="Phone" name="emergency_phone" type="tel" span="full" />
            <Field label="Relationship" name="emergency_relation" placeholder="Spouse, parent, etc." span="full" />
          </Section>
        )}

        {section === "work" && (
          <Section title="Employment (optional)">
            <Field label="Employer" name="employer_name" span="full" />
            <Select label="Employment status" name="employment_status" options={EMPLOYMENT_STATUS} />
            <Field label="Employer phone" name="employer_phone" type="tel" />
          </Section>
        )}

        {section === "finish" && (
          <Section title="Review & submit">
            <p className="text-base text-eggplant-800 col-span-full leading-relaxed">
              Tap each section above to review your answers. When everything looks
              correct, confirm below and submit. Front desk will finish insurance and
              case details on the computer.
            </p>
            <div className="col-span-full p-4 rounded-xl bg-neon-mint/10 border border-neon-mint/30">
              <Checkbox
                label="I certify the information above is correct to the best of my knowledge."
                name="signature_on_file"
              />
            </div>
            <Field
              label="Anything else we should know? (optional)"
              name="notes"
              span="full"
              multiline
            />
          </Section>
        )}
      </div>

      <footer className="shrink-0 border-t border-vice-border bg-white px-4 py-4 flex flex-wrap gap-3 items-center justify-between">
        <button
          type="button"
          disabled={idx <= 0}
          onClick={() => setSection(SECTIONS[idx - 1].id)}
          className="min-h-[48px] px-5 py-2 text-base border border-vice-border rounded-xl disabled:opacity-40 text-eggplant-800"
        >
          Back
        </button>
        {idx < SECTIONS.length - 1 ? (
          <button
            type="button"
            onClick={() => setSection(SECTIONS[idx + 1].id)}
            className="min-h-[48px] px-6 py-2 text-base font-semibold rounded-xl bg-eggplant-900 text-neon-mint"
          >
            Next section
          </button>
        ) : (
          <button
            type="submit"
            className="min-h-[52px] px-8 py-3 text-lg font-bold rounded-xl bg-gradient-to-r from-neon-pink to-neon-mint text-eggplant-950 shadow-lg"
          >
            Submit intake
          </button>
        )}
      </footer>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-vice-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-eggplant-900 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  span,
  hint,
  multiline,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  span?: "full";
  hint?: string;
  multiline?: boolean;
  [key: string]: unknown;
}) {
  const className =
    "w-full px-4 py-3 text-base bg-vice-surface border border-vice-border rounded-xl text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-2 focus:ring-neon-mint/50 focus:border-neon-mint min-h-[48px]";
  return (
    <div className={span === "full" ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-eggplant-800 mb-1.5">
        {label}
        {required ? " *" : ""}
      </label>
      {multiline ? (
        <textarea name={name} required={required} rows={4} className={className} />
      ) : (
        <input type={type} name={name} required={required} className={className} {...rest} />
      )}
      {hint ? <p className="text-xs text-vice-muted mt-1">{hint}</p> : null}
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
      <label className="block text-sm font-medium text-eggplant-800 mb-1.5">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full px-4 py-3 text-base bg-vice-surface border border-vice-border rounded-xl text-eggplant-900 min-h-[48px] focus:ring-2 focus:ring-neon-mint/50"
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
    <label className="flex items-start gap-3 text-base text-eggplant-800 cursor-pointer min-h-[44px]">
      <input
        type="checkbox"
        name={name}
        className="mt-1 w-5 h-5 rounded border-vice-border text-neon-mint focus:ring-neon-mint"
      />
      <span>{label}</span>
    </label>
  );
}
