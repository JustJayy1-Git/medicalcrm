"use client";

import Link from "next/link";

export function PrintToolbar({
  backHref,
  pageCount,
  pdfUrl,
}: {
  backHref: string;
  pageCount: number;
  pdfUrl?: string;
}) {
  return (
    <nav className="cms-no-print sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-vice-border bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-medium text-eggplant-900">CMS-1500 print preview</p>
        <p className="text-xs text-vice-muted">
          {pageCount === 0
            ? "No claim data for this selection."
            : `${pageCount} page(s) — use browser Print (Ctrl+P) for certified mail.`}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          href={backHref}
          className="rounded-md border border-vice-border px-3 py-1.5 text-sm hover:bg-vice-surface"
        >
          ← Back
        </Link>
        {pdfUrl ? (
          <a
            href={pdfUrl}
            download
            className="rounded-md border border-vice-border px-3 py-1.5 text-sm hover:bg-vice-surface"
          >
            Download PDF
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => {
            const iframe = document.querySelector(
              'iframe[title="CMS-1500 claim"]',
            ) as HTMLIFrameElement | null;
            if (iframe?.contentWindow) {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            } else {
              window.print();
            }
          }}
          className="rounded-md bg-neon-pink px-4 py-1.5 text-sm font-medium text-white hover:bg-eggplant-800"
        >
          Print
        </button>
      </div>
    </nav>
  );
}
