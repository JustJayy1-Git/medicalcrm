"use client";

import { PalmSilhouette } from "@/components/staff-landing/palm-silhouette";
import { SpineWatermark } from "@/components/staff-landing/spine-watermark";
import { SunsetSun } from "@/components/staff-landing/sunset-sun";

/**
 * Staff landing + sign-in — Miami sunset scene (natural silhouettes).
 * Lovable-style: soft sky, real palms, setting sun; spine as quiet watermark.
 */
export function StaffLandingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0a1628]" aria-hidden>
      {/* Twilight sky */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              #0c0f15 0%,
              #0f2840 28%,
              #1a4a6e 48%,
              #2d6a8f 62%,
              #e8785a 78%,
              #ffb84d 88%,
              #1a3a4a 100%
            )`,
        }}
      />
      <div
        className="staff-anim-sky-drift absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 90% 40% at 70% 72%, rgba(255,184,77,0.45) 0%, transparent 55%), radial-gradient(ellipse 60% 30% at 20% 80%, rgba(65,182,230,0.25) 0%, transparent 50%)",
        }}
      />

      {/* Horizon glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[38%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(12,15,21,0.4) 40%, #0c0f15 100%)",
        }}
      />

      {/* Sun — sits on horizon, right of center */}
      <div className="absolute bottom-[32%] left-1/2 w-[min(420px,70vw)] -translate-x-1/2 md:bottom-[34%]">
        <SunsetSun className="w-full h-auto opacity-90" />
      </div>

      {/* Left palm */}
      <div
        className="staff-anim-palm-left absolute bottom-0 -left-[2%] h-[58%] w-[min(240px,32vw)] md:w-[min(300px,26vw)]"
        style={{
          transformOrigin: "42% 95%",
          animation: "staff-palm-sway-left 14s ease-in-out infinite",
        }}
      >
        <PalmSilhouette className="h-full w-full opacity-[0.92]" />
      </div>

      {/* Right palm */}
      <div
        className="staff-anim-palm-right absolute bottom-0 -right-[4%] h-[52%] w-[min(220px,28vw)] md:w-[min(280px,22vw)]"
        style={{
          transformOrigin: "58% 95%",
          animation: "staff-palm-sway-right 16s ease-in-out infinite",
        }}
      >
        <PalmSilhouette className="h-full w-full opacity-[0.88]" flip />
      </div>

      {/* Spine watermark — right edge, very subtle */}
      <div className="absolute right-[6%] top-1/2 hidden h-[55%] w-16 -translate-y-1/2 opacity-[0.35] md:block lg:right-[12%] lg:w-20">
        <SpineWatermark className="h-full w-full" />
      </div>

      {/* Left spine mirror — balance */}
      <div className="absolute left-[8%] top-1/2 hidden h-[50%] w-14 -translate-y-1/2 opacity-20 md:block lg:left-[14%]">
        <SpineWatermark className="h-full w-full" style={{ transform: "scaleX(-1)" }} />
      </div>

      {/* Vignette for readable center content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 45%, transparent 0%, rgba(12,15,21,0.55) 100%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#41B6E6]/25 to-transparent" />
    </div>
  );
}
