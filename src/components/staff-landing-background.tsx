"use client";

/**
 * Staff landing + sign-in backdrop — Florida + spinal injury practice.
 * Detailed SVG art with subtle motion (respects prefers-reduced-motion).
 */
export function StaffLandingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0c0f15]" aria-hidden>
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 100%, #41B6E6 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 85% 15%, #DB3EB1 0%, transparent 50%)",
        }}
      />

      {/* —— Animated sun —— */}
      <div className="absolute -top-6 right-[6%] md:right-[10%] h-48 w-48 md:h-64 md:w-64">
        <div
          className="staff-anim-sun-pulse absolute inset-4 rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, #41B6E6 0%, transparent 70%)",
            animation: "staff-sun-pulse 5s ease-in-out infinite",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 200 200"
          fill="none"
        >
          <defs>
            <radialGradient id="staff-sun-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7ecff0" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#41B6E6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#41B6E6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="staff-sun-ray" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#41B6E6" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#7ecff0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#41B6E6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g
            className="staff-anim-sun-rays"
            style={{
              transformOrigin: "100px 100px",
              animation: "staff-sun-rays 90s linear infinite",
            }}
            opacity="0.22"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2="100"
                y2="18"
                stroke="url(#staff-sun-ray)"
                strokeWidth={i % 2 === 0 ? 3 : 2}
                strokeLinecap="round"
                transform={`rotate(${i * 22.5} 100 100)`}
              />
            ))}
          </g>
          <circle cx="100" cy="100" r="38" fill="url(#staff-sun-core)" opacity="0.5" />
          <circle
            cx="100"
            cy="100"
            r="34"
            stroke="#7ecff0"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <circle cx="100" cy="100" r="28" stroke="#41B6E6" strokeWidth="1" opacity="0.55" />
        </svg>
      </div>

      {/* —— Palm tree left —— */}
      <div
        className="staff-anim-palm-left absolute bottom-0 left-0 h-[48%] w-[min(220px,28vw)] md:w-[min(280px,22vw)]"
        style={{
          transformOrigin: "50% 92%",
          animation: "staff-palm-sway-left 7s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 200 400"
          className="h-full w-full opacity-[0.2]"
          fill="none"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="palm-trunk-l" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#41B6E6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#7ecff0" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#41B6E6" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path
            d="M98 400 C94 320 102 240 100 160 C98 120 104 80 100 55"
            stroke="url(#palm-trunk-l)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path d="M100 280 L88 278 M100 220 L90 218 M100 160 L89 158" stroke="#41B6E6" strokeWidth="1" opacity="0.35" />
          <g stroke="#41B6E6" strokeWidth="1.75" strokeLinecap="round" fill="none" opacity="0.55">
            <path d="M100 52 C55 38 25 18 12 2" />
            <path d="M100 48 C70 22 48 8 30 0" />
            <path d="M100 55 C40 48 18 35 5 22" />
            <path d="M100 50 C145 32 175 12 188 0" />
            <path d="M100 54 C155 42 178 28 192 14" />
            <path d="M100 58 C130 65 165 58 185 48" />
            <path d="M100 46 C118 8 135 0 148 4" />
          </g>
          <ellipse cx="100" cy="54" rx="22" ry="10" stroke="#7ecff0" strokeWidth="1" opacity="0.35" />
        </svg>
      </div>

      {/* —— Palm tree right —— */}
      <div
        className="staff-anim-palm-right absolute bottom-0 right-0 h-[44%] w-[min(200px,26vw)] md:w-[min(260px,20vw)]"
        style={{
          transformOrigin: "50% 92%",
          animation: "staff-palm-sway-right 8s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 200 400"
          className="h-full w-full opacity-[0.18]"
          fill="none"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="palm-trunk-r" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#DB3EB1" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#e878c8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#DB3EB1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M102 400 C106 310 96 230 100 150 C102 110 96 72 100 50"
            stroke="url(#palm-trunk-r)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <g stroke="#DB3EB1" strokeWidth="1.75" strokeLinecap="round" fill="none" opacity="0.5">
            <path d="M100 48 C148 30 178 10 192 0" />
            <path d="M100 52 C165 40 188 24 198 10" />
            <path d="M100 46 C60 28 32 10 18 0" />
            <path d="M100 50 C45 38 20 24 8 12" />
            <path d="M100 55 C75 62 42 58 22 50" />
            <path d="M100 44 C125 6 142 0 155 6" />
          </g>
        </svg>
      </div>

      {/* —— Spinal column (detailed lateral view) —— */}
      <div className="absolute left-1/2 top-[8%] h-[82%] w-[min(140px,18vw)] -translate-x-1/2 md:w-[min(160px,14vw)]">
        <svg
          viewBox="0 0 120 560"
          className="h-full w-full"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="spine-glow-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#41B6E6" stopOpacity="0" />
              <stop offset="45%" stopColor="#41B6E6" stopOpacity="0.5" />
              <stop offset="55%" stopColor="#DB3EB1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#41B6E6" stopOpacity="0" />
            </linearGradient>
            <filter id="spine-soft-glow" x="-40%" y="-10%" width="180%" height="120%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle scan line — injury / care motif */}
          <rect
            x="8"
            y="0"
            width="104"
            height="48"
            fill="url(#spine-glow-band)"
            className="staff-anim-spine-scan"
            style={{ animation: "staff-spine-scan 8s ease-in-out infinite" }}
            opacity="0.35"
          />

          {/* Curved alignment guide */}
          <path
            d="M60 28 C68 95 52 165 60 235 C68 305 52 375 60 445 C64 490 58 520 60 540"
            stroke="#41B6E6"
            strokeWidth="0.75"
            strokeDasharray="4 6"
            opacity="0.2"
          />

          {/* Vertebrae — cervical through lumbar */}
          <SpineVertebrae />

          {/* Nerve roots (cauda / lumbar) */}
          <g stroke="#DB3EB1" strokeWidth="1" opacity="0.35" strokeLinecap="round">
            <path d="M38 380 C22 395 14 410 8 428" />
            <path d="M82 385 C98 400 106 418 112 436" />
            <path d="M36 420 C20 438 12 455 6 472" />
            <path d="M84 425 C100 442 108 460 114 478" />
            <path d="M40 455 C28 472 18 488 12 502" />
            <path d="M80 458 C92 475 102 492 108 508" />
          </g>

          {/* Focus zone — mid lumbar (common PI injury) */}
          <ellipse
            cx="60"
            cy="318"
            rx="38"
            ry="22"
            fill="#41B6E6"
            className="staff-anim-spine-glow"
            style={{ animation: "staff-spine-glow 3.5s ease-in-out infinite" }}
            filter="url(#spine-soft-glow)"
          />
        </svg>
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#41B6E6]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#DB3EB1]/30 to-transparent" />
    </div>
  );
}

/** Side-view vertebrae along natural spinal curves. */
function SpineVertebrae() {
  const levels: Array<{
    y: number;
    bodyW: number;
    bodyH: number;
    spinous: number;
    trans: number;
    tilt?: number;
  }> = [
    { y: 32, bodyW: 22, bodyH: 14, spinous: 10, trans: 6, tilt: -4 },
    { y: 52, bodyW: 24, bodyH: 15, spinous: 11, trans: 7, tilt: -3 },
    { y: 72, bodyW: 26, bodyH: 16, spinous: 12, trans: 8, tilt: -2 },
    { y: 94, bodyW: 28, bodyH: 17, spinous: 13, trans: 8 },
    { y: 118, bodyW: 30, bodyH: 18, spinous: 14, trans: 9 },
    { y: 144, bodyW: 32, bodyH: 19, spinous: 15, trans: 10 },
    { y: 172, bodyW: 34, bodyH: 20, spinous: 16, trans: 10 },
    { y: 202, bodyW: 36, bodyH: 21, spinous: 17, trans: 11 },
    { y: 234, bodyW: 38, bodyH: 22, spinous: 18, trans: 11 },
    { y: 268, bodyW: 40, bodyH: 23, spinous: 19, trans: 12 },
    { y: 304, bodyW: 42, bodyH: 24, spinous: 20, trans: 12 },
    { y: 342, bodyW: 44, bodyH: 25, spinous: 21, trans: 13 },
    { y: 382, bodyW: 46, bodyH: 26, spinous: 22, trans: 13 },
    { y: 424, bodyW: 44, bodyH: 24, spinous: 20, trans: 12 },
    { y: 464, bodyW: 40, bodyH: 22, spinous: 18, trans: 11 },
    { y: 502, bodyW: 36, bodyH: 20, spinous: 16, trans: 10, tilt: 2 },
  ];

  return (
    <g opacity="0.22">
      {levels.map((v, i) => {
        const cx = 60 + (v.tilt ?? 0);
        const x = cx - v.bodyW / 2;
        const y = v.y;
        const discY = y + v.bodyH + 2;
        return (
          <g key={i}>
            {/* Intervertebral disc */}
            {i < levels.length - 1 && (
              <ellipse
                cx={cx}
                cy={discY}
                rx={v.bodyW * 0.42}
                ry={4}
                fill="#DB3EB1"
                opacity="0.35"
              />
            )}
            {/* Vertebral body */}
            <rect
              x={x}
              y={y}
              width={v.bodyW}
              height={v.bodyH}
              rx={5}
              stroke="#41B6E6"
              strokeWidth="1.5"
              fill="#121820"
              fillOpacity="0.6"
            />
            {/* Pedicles hint */}
            <path
              d={`M${x + 4} ${y + v.bodyH * 0.35} L${x - v.trans * 0.3} ${y + v.bodyH * 0.45} M${x + v.bodyW - 4} ${y + v.bodyH * 0.35} L${x + v.bodyW + v.trans * 0.3} ${y + v.bodyH * 0.45}`}
              stroke="#7ecff0"
              strokeWidth="1"
              opacity="0.6"
            />
            {/* Spinous process */}
            <path
              d={`M${cx} ${y + v.bodyH * 0.5} L${cx - 4} ${y + v.bodyH * 0.55} L${cx - 6} ${y + v.bodyH * 0.55 + v.spinous} L${cx + 2} ${y + v.bodyH * 0.52 + v.spinous * 0.85} Z`}
              stroke="#41B6E6"
              strokeWidth="1.25"
              fill="#0c0f15"
              fillOpacity="0.4"
              strokeLinejoin="round"
            />
            {/* Transverse processes */}
            <path
              d={`M${x} ${y + v.bodyH * 0.42} L${x - v.trans} ${y + v.bodyH * 0.48} M${x + v.bodyW} ${y + v.bodyH * 0.42} L${x + v.bodyW + v.trans} ${y + v.bodyH * 0.48}`}
              stroke="#DB3EB1"
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        );
      })}
      {/* Spinal cord canal hint (inside column) */}
      <path
        d="M60 40 C64 120 56 200 60 280 C64 360 56 440 60 510"
        stroke="#7ecff0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
        strokeDasharray="2 5"
      />
    </g>
  );
}
