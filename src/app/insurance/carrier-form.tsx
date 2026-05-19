"use client";

import Link from "next/link";

type Carrier = {
  id?: string;
  name?: string | null;
  carrier_type?: string | null;
  payer_id?: string | null;
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

export function CarrierForm({
  action,
  carrier,
  cancelHref,
  errorMsg,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => Promise<void>;
  carrier?: Carrier;
  cancelHref: string;
  errorMsg?: string | null;
  submitLabel?: string;
}) {
  const c = carrier ?? {};
  return (
    <form action={action} className="space-y-3">
      {c.id && <input type="hidden" name="id" value={c.id} />}

      {errorMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <section className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3">
          Carrier
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Name *" name="name" required defaultValue={c.name ?? ""} />
          <Select
            label="Type"
            name="carrier_type"
            defaultValue={c.carrier_type ?? "auto"}
            options={[
              { value: "auto", label: "Auto" },
              { value: "health", label: "Health" },
              { value: "workers_comp", label: "Workers' comp" },
              { value: "other", label: "Other" },
            ]}
          />
          <Field
            label="Payer ID (EDI)"
            name="payer_id"
            defaultValue={c.payer_id ?? ""}
          />
          <Field label="Claims phone" name="phone" type="tel" defaultValue={c.phone ?? ""} />
          <Field label="Fax" name="fax" type="tel" defaultValue={c.fax ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={c.email ?? ""} />
        </div>
      </section>

      <section className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3">
          Claims mailing address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Address line 1" name="address_line1" defaultValue={c.address_line1 ?? ""} />
          <Field label="Address line 2" name="address_line2" defaultValue={c.address_line2 ?? ""} />
          <div />
          <Field label="City" name="city" defaultValue={c.city ?? ""} />
          <Field label="State" name="state" maxLength={2} defaultValue={c.state ?? ""} />
          <Field label="Zip" name="zip" defaultValue={c.zip ?? ""} />
        </div>
      </section>

      <section className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3">
          Notes
        </h2>
        <textarea
          name="notes"
          rows={3}
          defaultValue={c.notes ?? ""}
          className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500"
        />
      </section>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
        <Link
          href={cancelHref}
          className="px-4 py-2 text-sm border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-gradient-to-b from-amber-400 to-amber-600 text-stone-900 font-semibold rounded-md hover:from-amber-300 hover:to-amber-500 shadow-sm"
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
      <label className="block text-[11px] font-medium text-stone-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500"
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
      <label className="block text-[11px] font-medium text-stone-600 mb-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full px-2 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
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
