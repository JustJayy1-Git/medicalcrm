"use client";

import { PalmSilhouette } from "@/components/staff-landing/palm-silhouette";

/** Soft palm silhouettes at CRM panel edges — matches landing scene. */
export function StaffCrmSideAccents() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="staff-anim-palm-left absolute -left-8 bottom-0 h-[48%] w-32 opacity-[0.04] md:w-40"
        style={{
          transformOrigin: "42% 95%",
          animation: "staff-palm-sway-left 16s ease-in-out infinite",
        }}
      >
        <PalmSilhouette className="h-full w-full" />
      </div>
      <div
        className="staff-anim-palm-right absolute -right-6 bottom-0 h-[44%] w-28 opacity-[0.035] md:w-36"
        style={{
          transformOrigin: "58% 95%",
          animation: "staff-palm-sway-right 18s ease-in-out infinite",
        }}
      >
        <PalmSilhouette className="h-full w-full" flip />
      </div>
    </div>
  );
}
