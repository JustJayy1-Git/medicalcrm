"use client";

import Link from "next/link";

type Attorney = {
  id?: string;
  attorney_name?: string | null;
  firm_name?: string | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  notes?: string | null;
};

export function AttorneyForm({
  action,
  attorney,
  cancelHref,
  errorMsg,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => Promise<void>;
  attorney?: Attorney;
  cancelHref: string;
  errorMsg?: string | null;
  submitLabel?: string;
}) {
  const a = attorney ?? {};
  return (
    <form action={action} className="space-y-3">
      {a.id && <input type="hidden" name="id" value={a.id} />}

      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Attorney
        </h2>
        <p className="text-xs text-vice-muted mb-3 -mt-1">
          Contact info appears on the case Attorney tab when staff pick this
          attorney for LOP cases.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Attorney name *"
            name="attorney_name"
            required
            defaultValue={a.attorney_name ?? ""}
          />
          <Field label="Firm name" name="firm_name" defaultValue={a.firm_name ?? ""} />
          <Field label="Phone" name="phone" type="tel" defaultValue={a.phone ?? ""} />
          <Field label="Fax" name="fax" type="tel" defaultValue={a.fax ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={a.email ?? ""} />
        </div>
      </section>

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Office address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Address line 1" name="address_line1" defaultValue={a.address_line1 ?? ""} />
          <Field label="Address line 2" name="address_line2" defaultValue={a.address_line2 ?? ""} />
          <div />
          <Field label="City" name="city" defaultValue={a.city ?? ""} />
          <Field label="State" name="state" maxLength={2} defaultValue={a.state ?? ""} />
          <Field label="Zip" name="zip" defaultValue={a.zip ?? ""} />
        </div>
      </section>

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Notes
        </h2>
        <textarea
          name="notes"
          rows={3}
          defaultValue={a.notes ?? ""}
          className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
        />
      </section>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-vice-border">
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
      </div>
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
    <div>
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
    </div>
  );
}
