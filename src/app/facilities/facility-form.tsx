"use client";

import Link from "next/link";

type Facility = {
  id?: string;
  name?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  fax?: string | null;
  npi?: string | null;
  tax_id?: string | null;
  is_active?: boolean | null;
};

export function FacilityForm({
  action,
  facility,
  cancelHref,
  errorMsg,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => Promise<void>;
  facility?: Facility;
  cancelHref: string;
  errorMsg?: string | null;
  submitLabel?: string;
}) {
  const f = facility ?? {};
  const isActive = f.is_active !== false;

  return (
    <form action={action} className="space-y-3">
      {f.id && <input type="hidden" name="id" value={f.id} />}

      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Facility
        </h2>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Name *" name="name" required defaultValue={f.name ?? ""} />
          <Field label="Phone" name="phone" type="tel" defaultValue={f.phone ?? ""} />
          <Field label="Fax" name="fax" type="tel" defaultValue={f.fax ?? ""} />
          <label className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={isActive}
              className="rounded border-vice-border text-neon-mint focus:ring-neon-mint"
            />
            <span className="text-sm text-eggplant-800">Active location</span>
          </label>
        </section>
      </section>

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Address
        </h2>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field
            label="Address line 1"
            name="address_line1"
            defaultValue={f.address_line1 ?? ""}
          />
          <Field
            label="Address line 2"
            name="address_line2"
            defaultValue={f.address_line2 ?? ""}
          />
          <span />
          <Field label="City" name="city" defaultValue={f.city ?? ""} />
          <Field label="State" name="state" maxLength={2} defaultValue={f.state ?? ""} />
          <Field label="Zip" name="zip" defaultValue={f.zip ?? ""} />
        </section>
      </section>

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Billing (CMS-1500)
        </h2>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="NPI" name="npi" defaultValue={f.npi ?? ""} />
          <Field label="Federal tax ID" name="tax_id" defaultValue={f.tax_id ?? ""} />
        </section>
      </section>

      <section className="flex items-center justify-end gap-3 pt-2 border-t border-vice-border">
        <Link
          href={cancelHref}
          className="px-4 py-2 text-sm border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm"
        >
          {submitLabel}
        </button>
      </section>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  [key: string]: unknown;
}) {
  return (
    <section>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
        {...rest}
      />
    </section>
  );
}
