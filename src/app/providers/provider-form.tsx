"use client";

import Link from "next/link";

type Provider = {
  id?: string;
  full_name?: string | null;
  credentials?: string | null;
  npi?: string | null;
  tax_id?: string | null;
  taxonomy_code?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean | null;
};

export function ProviderForm({
  action,
  provider,
  cancelHref,
  errorMsg,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => Promise<void>;
  provider?: Provider;
  cancelHref: string;
  errorMsg?: string | null;
  submitLabel?: string;
}) {
  const p = provider ?? {};
  const isActive = p.is_active !== false;

  return (
    <form action={action} className="space-y-3">
      {p.id && <input type="hidden" name="id" value={p.id} />}

      {errorMsg ? (
        <p className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </p>
      ) : null}

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Provider identity
        </h2>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Full name *"
            name="full_name"
            required
            defaultValue={p.full_name ?? ""}
            placeholder="Jane Smith"
          />
          <Field
            label="Credentials"
            name="credentials"
            defaultValue={p.credentials ?? ""}
            placeholder="DC, DPT, MD"
          />
          <label className="flex items-center gap-2 pt-5 md:col-span-2">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={isActive}
              className="rounded border-vice-border text-neon-mint focus:ring-neon-mint"
            />
            <span className="text-sm text-eggplant-800">Active provider</span>
          </label>
        </section>
      </section>

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Billing identifiers
        </h2>
        <p className="text-xs text-vice-muted mb-3 -mt-1">
          NPI and taxonomy appear on claims and visit charges.
        </p>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="NPI (National Provider Identifier)"
            name="npi"
            defaultValue={p.npi ?? ""}
            placeholder="10-digit NPI"
            maxLength={10}
          />
          <Field
            label="Tax ID (EIN / SSN)"
            name="tax_id"
            defaultValue={p.tax_id ?? ""}
          />
          <Field
            label="Taxonomy code"
            name="taxonomy_code"
            defaultValue={p.taxonomy_code ?? ""}
            placeholder="e.g. 111N00000X"
            className="md:col-span-2"
          />
        </section>
      </section>

      <section className="p-4 rounded-lg bg-white border border-vice-border shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
          Contact
        </h2>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Phone" name="phone" type="tel" defaultValue={p.phone ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={p.email ?? ""} />
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
  placeholder,
  maxLength,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <section className={className}>
      <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded text-eggplant-900 placeholder-vice-muted focus:outline-none focus:ring-1 focus:ring-neon-mint/40 focus:border-neon-mint"
      />
    </section>
  );
}
