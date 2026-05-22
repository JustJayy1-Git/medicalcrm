"use client";

import { FORM_ORDER, type FormSlug } from "@/lib/intake-packet/form-slugs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StaffExitButton } from "./staff-exit-button";

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
  const idx = FORM_ORDER.indexOf(slug);
  const next = idx < FORM_ORDER.length - 1 ? FORM_ORDER[idx + 1] : null;
  const src = `/serve/forms/${slug}?packetId=${packetId}`;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== "pro-injury-nav") return;
      const target = e.data.slug as FormSlug;
      router.push(`/portal/packet/${packetId}/forms/${target}`);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [packetId, router]);

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
          {next ? (
            <Link
              href={
                mode === "staff"
                  ? `/intake-packets/${packetId}/forms/${next}`
                  : `/portal/packet/${packetId}/forms/${next}`
              }
              className="text-xs font-bold uppercase px-3 py-1.5 rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white"
            >
              Next →
            </Link>
          ) : (
            <Link
              href={
                mode === "staff"
                  ? `/intake-packets/${packetId}`
                  : `/portal/done?packet=${packetId}`
              }
              className="text-xs font-bold uppercase px-3 py-1.5 rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white"
            >
              Finish
            </Link>
          )}
          {mode === "kiosk" ? <StaffExitButton /> : null}
        </div>
      </header>
      <p className="sr-only">{title}</p>
      <iframe
        title={title}
        className="flex-1 w-full min-h-0 border-0 bg-[#1a1d24]"
        src={src}
        style={{ touchAction: "pan-x pan-y pinch-zoom" }}
      />
    </div>
  );
}
