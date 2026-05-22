"use client";

import { useEffect, useState } from "react";

export function Cms1500PdfViewer({
  pdfUrl,
  pageCount,
}: {
  pdfUrl: string;
  pageCount: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [pdfUrl]);

  if (!ready) {
    return <p className="p-8 text-sm text-vice-muted">Loading claim PDF…</p>;
  }

  return (
    <section className="flex flex-col items-center gap-4 py-4">
      <p className="cms-no-print text-xs text-vice-muted max-w-lg text-center">
        Preview uses your blank CMS-1500 PDF with data overlaid. Print from the
        toolbar (one form per treatment day, up to 6 CPT lines in box 24).
        {pageCount > 1 ? ` ${pageCount} pages.` : ""}
      </p>
      <iframe
        title="CMS-1500 claim"
        src={pdfUrl}
        className="border border-vice-border shadow-md"
        style={{ width: "8.5in", height: "11in", maxWidth: "100%" }}
      />
    </section>
  );
}
