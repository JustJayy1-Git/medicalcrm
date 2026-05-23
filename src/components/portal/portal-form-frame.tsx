"use client";

import { FORM_ORDER, type FormSlug } from "@/lib/intake-packet/form-slugs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { StaffExitButton } from "./staff-exit-button";

function flushIframeSave(iframe: HTMLIFrameElement | null): Promise<boolean> {
  return new Promise((resolve) => {
    const win = iframe?.contentWindow;
    if (!win) {
      resolve(true);
      return;
    }

    if (typeof win.__proInjuryFlushSave === "function") {
      void win.__proInjuryFlushSave()
        .then((ok) => resolve(ok !== false))
        .catch(() => resolve(false));
      return;
    }

    const requestId = `${Date.now()}-${Math.random()}`;
    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(true);
    }, 2500);

    const onMessage = (e: MessageEvent) => {
      if (e.source !== win) return;
      if (e.data?.type !== "pro-injury-flush-done") return;
      if (e.data.requestId !== requestId) return;
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      resolve(Boolean(e.data.ok));
    };

    window.addEventListener("message", onMessage);
    win.postMessage({ type: "pro-injury-flush-save", requestId }, "*");
  });
}

export function PortalFormFrame({
  packetId,
  slug,
  title,
  page,
  mode = "kiosk",
}: {
  packetId: number;
  slug: FormSlug;
  title: string;
  page: number;
  mode?: "kiosk" | "staff";
}) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const idx = FORM_ORDER.indexOf(slug);
  const prev = idx > 0 ? FORM_ORDER[idx - 1] : null;
  const next = idx < FORM_ORDER.length - 1 ? FORM_ORDER[idx + 1] : null;

  const basePath =
    mode === "staff" ? `/intake-packets/${packetId}/forms` : `/portal/packet/${packetId}/forms`;

  const navigateTo = useCallback(
    async (href: string) => {
      await flushIframeSave(iframeRef.current);
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== "pro-injury-nav") return;
      const target = e.data.slug as FormSlug;
      void navigateTo(`${basePath}/${target}`);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [basePath, navigateTo]);

  useEffect(() => {
    const iframe = iframeRef.current;
    return () => {
      void flushIframeSave(iframe);
    };
  }, [slug]);

  const nextHref = next
    ? `${basePath}/${next}`
    : mode === "staff"
      ? `/intake-packets/${packetId}`
      : `/portal/done?packet=${packetId}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1d24]">
      <header className="flex items-center justify-between gap-3 px-4 py-2 bg-[#0c0f15] border-b border-[#2a2f3a] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={mode === "staff" ? `/intake-packets/${packetId}` : "/portal"}
            className="text-xs font-bold uppercase tracking-wider text-[#c8d2e0] hover:text-white"
          >
            Pro Injury
          </Link>
          <span className="text-[10px] text-[#c8d2e0]/70 uppercase tracking-widest">
            Page {String(page).padStart(2, "0")} of 08
          </span>
        </div>
        <div className="flex items-center gap-3">
          {prev ? (
            <button
              type="button"
              onClick={() => void navigateTo(`${basePath}/${prev}`)}
              className="text-xs font-bold uppercase px-3 py-1.5 rounded-md border border-[#2a2f3a] text-[#c8d2e0] hover:text-white hover:border-[#41B6E6]"
            >
              ← Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void navigateTo(nextHref)}
            className="text-xs font-bold uppercase px-3 py-1.5 rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white"
          >
            {next ? "Next →" : "Finish"}
          </button>
          {mode === "kiosk" ? <StaffExitButton /> : null}
        </div>
      </header>
      <p className="sr-only">{title}</p>
      <iframe
        ref={iframeRef}
        title={title}
        className="flex-1 w-full min-h-0 border-0 bg-[#1a1d24]"
        src={`/serve/forms/${slug}?packetId=${packetId}`}
        style={{ touchAction: "pan-x pan-y pinch-zoom" }}
      />
    </div>
  );
}

declare global {
  interface Window {
    __proInjuryFlushSave?: () => Promise<boolean>;
  }
}
