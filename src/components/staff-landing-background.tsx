"use client";

import { PalmSilhouette } from "@/components/staff-landing/palm-silhouette";
import { SpineWatermark } from "@/components/staff-landing/spine-watermark";

/**
 * Staff landing + sign-in — Miami Vice palette, palms, S-curve spine watermark.
 * Sun = soft corner glow only (no disc in center).
 */
export function StaffLandingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0c0f15]" aria-hidden>
      {/* Original LUKARIENZ sky — cyan + pink on dark */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -8%, #41B6E6 0%, transparent 58%), radial-gradient(ellipse 65% 45% at 100% 100%, #DB3EB1 0%, transparent 52%), radial-gradient(ellipse 55% 40% at 0% 85%, #41B6E6 0%, transparent 48%)",
        }}
      />

      {/* Soft sunlight — top-right corner, ambient only */}
      <div
        className="staff-anim-sun-glow absolute -top-24 -right-16 h-[min(380px,55vh)] w-[min(380px,55vw)] rounded-full opacity-100"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(126,207,240,0.28) 0%, rgba(65,182,230,0.12) 28%, rgba(219,62,177,0.06) 45%, transparent 68%)",
        }}
      />

      {/* Secondary accent — top-left, very faint */}
      <div
        className="absolute -top-16 -left-12 h-64 w-64 rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(65,182,230,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Single S-curve spine — behind content */}
      <div className="absolute left-1/2 top-1/2 h-[min(72vh,520px)] w-[min(100px,14vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.22]">
        <SpineWatermark className="h-full w-full" />
      </div>

      {/* Left palm */}
      <div
        className="staff-anim-palm-left absolute bottom-0 -left-[2%] h-[58%] w-[min(240px,32vw)] md:w-[min(300px,26vw)]"
        style={{
          transformOrigin: "42% 95%",
          animation: "staff-palm-sway-left 14s ease-in-out infinite",
        }}
      >
        <PalmSilhouette className="h-full w-full opacity-[0.88]" />
      </div>

      {/* Right palm */}
      <div
        className="staff-anim-palm-right absolute bottom-0 -right-[4%] h-[52%] w-[min(220px,28vw)] md:w-[min(280px,22vw)]"
        style={{
          transformOrigin: "58% 95%",
          animation: "staff-palm-sway-right 16s ease-in-out infinite",
        }}
      >
        <PalmSilhouette className="h-full w-full opacity-[0.84]" flip />
      </div>

      {/* Center vignette — keeps copy readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 50% 42%, transparent 0%, rgba(12,15,21,0.5) 100%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#41B6E6]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#DB3EB1]/30 to-transparent" />
    </div>
  );
}
