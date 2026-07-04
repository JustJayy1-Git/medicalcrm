"use client";

import Link from "next/link";

/** Dark no-print toolbar for printable pages. */
export function PrintToolbar({
  backHref,
  backLabel,
  title,
}: {
  backHref: string;
  backLabel: string;
  title: string;
}) {
  return (
    <div className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#0c0f15] px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          className="lux-gold-text shrink-0 font-serif text-xs font-bold uppercase tracking-wider"
        >
          ← {backLabel}
        </Link>
        <span className="truncate text-[10px] uppercase tracking-widest text-[#c8d2e0]/70">
          {title}
        </span>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="shrink-0 rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-4 py-1.5 text-xs font-bold uppercase text-white"
      >
        🖨 Print
      </button>
    </div>
  );
}
