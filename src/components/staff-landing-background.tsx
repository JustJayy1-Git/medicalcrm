"use client";

/** Outline art for staff landing + sign-in (Florida / spine practice — not iPad portal). */
export function StaffLandingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0c0f15]" aria-hidden>
      {/* Soft base wash only — no grid, blobs, or wave fills */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 110%, #41B6E6 0%, transparent 55%)",
        }}
      />

      {/* Sun — upper right */}
      <svg
        className="absolute -top-8 right-[8%] h-44 w-44 md:h-56 md:w-56 opacity-[0.14]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="42" stroke="#41B6E6" strokeWidth="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="100"
            y1="100"
            x2={100 + 72 * Math.cos((deg * Math.PI) / 180)}
            y2={100 + 72 * Math.sin((deg * Math.PI) / 180)}
            stroke="#41B6E6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Palm trees — left and right */}
      <svg
        className="absolute bottom-0 left-[2%] h-[42%] w-36 md:w-48 opacity-[0.12]"
        viewBox="0 0 120 280"
        fill="none"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d="M60 280 L60 120"
          stroke="#41B6E6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M60 95 Q20 70 8 45 M60 100 Q35 55 15 25 M60 105 Q55 40 40 15 M60 98 Q85 60 105 35 M60 102 Q95 50 112 20"
          stroke="#41B6E6"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="absolute bottom-0 right-[4%] h-[38%] w-32 md:w-44 opacity-[0.12]"
        viewBox="0 0 120 280"
        fill="none"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d="M60 280 L60 130"
          stroke="#DB3EB1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M60 105 Q25 75 10 50 M60 108 Q40 58 22 30 M60 110 Q58 35 48 12 M60 100 Q90 65 108 40 M60 103 Q100 48 115 22"
          stroke="#DB3EB1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Spinal cord — center, subtle */}
      <svg
        className="absolute left-1/2 top-[12%] h-[76%] w-24 -translate-x-1/2 opacity-[0.11] md:w-28"
        viewBox="0 0 80 520"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M40 20 C48 80 32 140 40 200 C48 260 32 320 40 380 C48 440 36 480 40 500"
          stroke="#41B6E6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460].map((y) => (
          <ellipse
            key={y}
            cx="40"
            cy={y}
            rx="14"
            ry="9"
            stroke="#DB3EB1"
            strokeWidth="1.25"
          />
        ))}
        <path
          d="M40 200 L22 175 M40 200 L58 175 M40 320 L20 295 M40 320 L60 295"
          stroke="#41B6E6"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#41B6E6]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#DB3EB1]/30 to-transparent" />
    </div>
  );
}
