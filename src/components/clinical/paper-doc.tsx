import { LogoMark } from "@/components/logo-mark";
import type { ReactNode } from "react";

/**
 * Paper-document primitives for the NP consultation packet — recreates the
 * patient iPad intake sheet look (white letter page, black brand header,
 * numbered sections, lined fields) as React components.
 */

export function PaperSheet({
  title,
  titleEs,
  page,
  totalPages,
  children,
}: {
  title: string;
  titleEs?: string;
  page: number;
  totalPages: number;
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto my-6 w-[816px] max-w-full min-h-[1056px] bg-white text-black shadow-[0_24px_60px_rgba(0,0,0,0.45)] overflow-hidden">
      {/* Watermark */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.05]"
        aria-hidden
      >
        <LogoMark tone="light" width={480} height={480} className="w-[480px] h-auto" />
      </div>

      <div className="relative z-[1]">
        {/* Letterhead — matches the practice's paper documents */}
        <div className="grid grid-cols-[90px_1fr_auto] items-center gap-4 bg-black px-6 py-3.5 text-white">
          <div className="flex h-[74px] w-[74px] items-center justify-center">
            <LogoMark width={74} height={74} className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="font-serif text-[26px] font-bold leading-none tracking-[0.04em]">
              PRO INJURY
            </p>
            <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#41B6E6]">
              Medical &amp; Rehabilitation
            </p>
            <div className="mt-1.5 h-[2px] w-[220px] bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1]" />
          </div>
          <div className="text-right text-[9px] leading-[1.5]">
            <p>5881 NW 151st Street, Suite 112</p>
            <p>Miami Lakes, FL 33014</p>
            <p className="mt-1">6309 Corporate Court, Suite 100/103</p>
            <p>Fort Myers, FL 33919</p>
            <p className="mt-1 font-semibold text-[#41B6E6]">
              T 786-362-5480 · F 786-362-5638
            </p>
            <p className="text-[#41B6E6]">ProInjuryLLC@gmail.com</p>
          </div>
        </div>

        {/* Page title */}
        <div className="flex items-start justify-between gap-3 border-b border-[#e0e0e0] px-6 pb-2 pt-3">
          <h1 className="m-0 max-w-[600px] text-[14px] font-extrabold uppercase leading-snug">
            {title}
            {titleEs ? (
              <span className="mt-0.5 block text-[11px] font-normal normal-case opacity-55">
                {titleEs}
              </span>
            ) : null}
          </h1>
          <span className="inline-flex shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.18em]">
            <span className="rounded-full bg-black px-2.5 py-1 font-bold tracking-[0.08em] text-white">
              Page {String(page).padStart(2, "0")}
              <span className="ml-0.5 opacity-55">/ {String(totalPages).padStart(2, "0")}</span>
            </span>
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}

export function PaperIdentStrip({
  fields,
}: {
  fields: Array<{ label: string; value: string }>;
}) {
  return (
    <div
      className="grid gap-3 border-b border-[#d0d0d0] bg-[#fafafa] px-6 py-2"
      style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}
    >
      {fields.map((f) => (
        <div key={f.label}>
          <span className="block text-[7.5px] font-bold uppercase tracking-[0.12em] text-black/55">
            {f.label}
          </span>
          <span className="block border-b border-black/50 pb-0.5 text-[11px] font-medium min-h-[17px]">
            {f.value || "\u00A0"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PaperSection({
  num,
  title,
  titleEs,
  children,
}: {
  num: number;
  title: string;
  titleEs?: string;
  children: ReactNode;
}) {
  return (
    <section className="px-6 pt-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
          {num}
        </span>
        <h2 className="m-0 text-[11px] font-extrabold uppercase tracking-[0.06em]">
          {title}
          {titleEs ? (
            <span className="ml-2 text-[9.5px] font-normal normal-case opacity-55">
              {titleEs}
            </span>
          ) : null}
        </h2>
      </div>
      <div className="mb-2 mt-1 h-px bg-black/20" />
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export function PaperField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: "text" | "date" | "number";
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-black/60">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full border-0 border-b border-black/50 bg-transparent px-0 py-1 text-[12px] focus:border-black focus:outline-none"
        style={{ boxShadow: "none" }}
      />
    </label>
  );
}

export function PaperTextarea({
  label,
  name,
  rows = 4,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  rows?: number;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-black/60">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full resize-y rounded-sm border border-black/30 bg-transparent px-2 py-1.5 text-[12px] leading-relaxed focus:border-black focus:outline-none"
        style={{
          boxShadow: "none",
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 21px, rgba(0,0,0,0.12) 21px, rgba(0,0,0,0.12) 22px)",
          lineHeight: "22px",
        }}
      />
    </label>
  );
}

export function PaperCheckGroup({
  legend,
  name,
  options,
  defaultValue,
}: {
  legend: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="block p-0 text-[8px] font-bold uppercase tracking-[0.12em] text-black/60">
        {legend}
      </legend>
      <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1.5">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 text-[12px]"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={defaultValue === o.value}
              className="h-[15px] w-[15px] accent-black"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Single checkbox rendered like the paper form's square boxes. */
export function PaperCheck({
  name,
  label,
  defaultChecked,
  className = "",
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-1.5 text-[11px] leading-tight ${className}`.trim()}
    >
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={defaultChecked}
        className="h-[13px] w-[13px] shrink-0 accent-black"
      />
      {label}
    </label>
  );
}

/** Inline "Label: ______" field like the paper form. */
export function PaperInline({
  label,
  name,
  defaultValue,
  type = "text",
  className = "",
  inputClassName = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: "text" | "date" | "number";
  className?: string;
  inputClassName?: string;
}) {
  return (
    <label className={`flex items-baseline gap-1.5 text-[11px] ${className}`.trim()}>
      <span className="shrink-0 font-semibold">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className={`min-w-0 flex-1 border-0 border-b border-black/50 bg-transparent px-1 py-0.5 text-[11px] focus:border-black focus:outline-none ${inputClassName}`.trim()}
        style={{ boxShadow: "none" }}
      />
    </label>
  );
}

export function PaperNote({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 rounded-sm border border-black/20 bg-[#fafafa] px-3 py-2 text-[10px] leading-relaxed text-black/80">
      {children}
    </p>
  );
}
