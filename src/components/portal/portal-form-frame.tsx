"use client";

import {
  FULL_FORM_COUNT,
  getFormNavigationOrder,
  getPortalPageNumber,
  PORTAL_FORM_COUNT,
  type FormSlug,
} from "@/lib/intake-packet/form-slugs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { StaffExitButton } from "./staff-exit-button";

type ValidationIssue = {
  slug: FormSlug;
  page: number;
  field: string;
  label: string;
};

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
    }, 4000);

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

function highlightIssuesInIframe(
  iframe: HTMLIFrameElement | null,
  slug: FormSlug,
  fields: string[],
) {
  const win = iframe?.contentWindow;
  if (!win) return;
  win.postMessage({ type: "pro-injury-highlight", slug, fields }, "*");
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
  const [iframeHeight, setIframeHeight] = useState(1200);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    [],
  );
  const navOrder = getFormNavigationOrder(mode);
  const idx = navOrder.indexOf(slug);
  const prev = idx > 0 ? navOrder[idx - 1] : null;
  const next = idx < navOrder.length - 1 ? navOrder[idx + 1] : null;
  const totalPages = mode === "kiosk" ? PORTAL_FORM_COUNT : FULL_FORM_COUNT;
  const displayPage = mode === "kiosk" ? getPortalPageNumber(slug) || page : page;
  const isKiosk = mode === "kiosk";

  const basePath =
    mode === "staff" ? `/intake-packets/${packetId}/forms` : `/portal/packet/${packetId}/forms`;

  const navigateTo = useCallback(
    async (href: string) => {
      setValidationIssues([]);
      const ok = await flushIframeSave(iframeRef.current);
      if (!ok) return;
      router.push(href);
    },
    [router],
  );

  const finishIntake = useCallback(async () => {
    setValidationIssues([]);
    const ok = await flushIframeSave(iframeRef.current);
    if (!ok) return;

    if (mode === "kiosk") {
      const validateRes = await fetch(`/api/intake-packets/${packetId}/validate`, {
        method: "POST",
      });
      const validation = (await validateRes.json()) as {
        ok?: boolean;
        issues?: ValidationIssue[];
        error?: string;
      };

      if (!validation.ok) {
        const issues = validation.issues ?? [];
        setValidationIssues(issues);
        const first = issues[0];
        if (first) {
          if (first.slug !== slug) {
            router.push(`${basePath}/${first.slug}`);
          } else {
            highlightIssuesInIframe(iframeRef.current, slug, [
              first.field,
            ]);
          }
        }
        return;
      }

      try {
        const completeRes = await fetch(`/api/intake-packets/${packetId}/complete`, {
          method: "POST",
        });
        const body = (await completeRes.json()) as { error?: string };
        if (!completeRes.ok) {
          setValidationIssues([
            {
              slug: "records",
              page: 7,
              field: "",
              label: body.error ?? "Could not complete intake",
            },
          ]);
          return;
        }
      } catch {
        // done page retries completion
      }
    }

    router.push(
      mode === "staff"
        ? `/intake-packets/${packetId}`
        : `/portal/done?packet=${packetId}`,
    );
  }, [router, mode, packetId, basePath, slug]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "pro-injury-resize" && typeof e.data.height === "number") {
        setIframeHeight(Math.max(900, Math.min(e.data.height + 24, 20000)));
        return;
      }
      if (e.data?.type === "pro-injury-nav" && e.data.slug) {
        void navigateTo(`${basePath}/${e.data.slug as FormSlug}`);
        return;
      }
      if (e.data?.type === "pro-injury-nav-back" && prev) {
        void navigateTo(`${basePath}/${prev}`);
        return;
      }
      if (e.data?.type === "pro-injury-finish") {
        void finishIntake();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [basePath, navigateTo, prev, finishIntake]);

  useEffect(() => {
    if (validationIssues.length === 0) return;
    const forPage = validationIssues.filter((i) => i.slug === slug);
    if (forPage.length > 0) {
      highlightIssuesInIframe(
        iframeRef.current,
        slug,
        forPage.map((i) => i.field),
      );
    }
  }, [slug, validationIssues]);

  useEffect(() => {
    setIframeHeight(1200);
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

  const iframeSrc = `/serve/forms/${slug}?packetId=${packetId}${isKiosk ? "&portal=1" : ""}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1d24]">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-2 bg-[#0c0f15] border-b border-[#2a2f3a] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={mode === "staff" ? `/intake-packets/${packetId}` : "/portal"}
            className="text-xs font-bold uppercase tracking-wider text-[#c8d2e0] hover:text-white"
          >
            Pro Injury
          </Link>
          <span className="text-[10px] text-[#c8d2e0]/70 uppercase tracking-widest">
            Page {String(displayPage).padStart(2, "0")} of {String(totalPages).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isKiosk && prev ? (
            <button
              type="button"
              onClick={() => void navigateTo(`${basePath}/${prev}`)}
              className="text-xs font-bold uppercase px-3 py-1.5 rounded-md border border-[#2a2f3a] text-[#c8d2e0] hover:text-white hover:border-[#41B6E6]"
            >
              ← Back
            </button>
          ) : null}
          {!isKiosk ? (
            <button
              type="button"
              onClick={() => void (next ? navigateTo(nextHref) : finishIntake())}
              className="text-xs font-bold uppercase px-3 py-1.5 rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white"
            >
              {next ? "Next →" : "Finish"}
            </button>
          ) : null}
          {isKiosk ? <StaffExitButton /> : null}
        </div>
      </header>

      {validationIssues.length > 0 ? (
        <div className="shrink-0 px-4 py-3 bg-[#7f1d3a] text-white text-sm border-b border-[#DB3EB1]/40">
          <p className="font-semibold mb-1">
            Please complete required items before submitting:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-white/90">
            {validationIssues.map((issue, i) => (
              <li key={`${issue.slug}-${issue.field}-${i}`}>
                Page {issue.page}: {issue.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="sr-only">{title}</p>
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <iframe
          ref={iframeRef}
          title={title}
          className="w-full border-0 bg-[#1a1d24] block"
          src={iframeSrc}
          style={{
            height: `${iframeHeight}px`,
            touchAction: "pan-x pan-y pinch-zoom",
          }}
        />
      </main>
    </div>
  );
}

declare global {
  interface Window {
    __proInjuryFlushSave?: () => Promise<boolean>;
  }
}
