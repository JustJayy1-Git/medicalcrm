"use client";

import { useCallback } from "react";

/**
 * Stacks every intake form (same-origin /serve/forms pages) and sizes each
 * frame to its rendered content so the whole packet prints with one command,
 * one page-break per form.
 */
export function IntakePrintFrames({
  packetId,
  slugs,
}: {
  packetId: number;
  slugs: Array<{ slug: string; title: string }>;
}) {
  const sizeFrame = useCallback((frame: HTMLIFrameElement | null) => {
    if (!frame) return;
    const resize = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc?.body) return;
        frame.style.height = `${Math.max(1056, doc.body.scrollHeight + 24)}px`;
      } catch {
        frame.style.height = "1100px";
      }
    };
    frame.addEventListener("load", () => {
      resize();
      // Fonts/prefill can shift height after load.
      setTimeout(resize, 800);
      setTimeout(resize, 2000);
    });
  }, []);

  return (
    <div className="mx-auto w-[840px] max-w-full space-y-4 print:space-y-0">
      {slugs.map(({ slug, title }) => (
        <div key={slug} className="intake-print-page">
          <p className="no-print px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c8d2e0]/50">
            {title}
          </p>
          <iframe
            ref={sizeFrame}
            src={`/serve/forms/${slug}?packetId=${packetId}`}
            title={title}
            className="block w-full border-0 bg-white"
            style={{ height: 1100 }}
          />
        </div>
      ))}
    </div>
  );
}
