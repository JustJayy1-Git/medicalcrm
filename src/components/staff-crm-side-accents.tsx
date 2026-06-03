"use client";

/** Very subtle spine + palm accents on CRM main panel edges (staff only). */
export function StaffCrmSideAccents() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="staff-anim-palm-left absolute -left-4 bottom-0 h-[55%] w-28 opacity-[0.06] md:w-36"
        style={{
          transformOrigin: "50% 100%",
          animation: "staff-palm-sway-left 9s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 120 280" className="h-full w-full" fill="none">
          <path d="M60 280 L60 100" stroke="#41B6E6" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M60 95 C25 70 8 45 2 25 M60 98 C45 50 25 25 12 8 M60 100 C90 55 110 25 118 8"
            stroke="#41B6E6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        className="staff-anim-palm-right absolute -right-2 bottom-0 h-[50%] w-24 opacity-[0.05] md:w-32"
        style={{
          transformOrigin: "50% 100%",
          animation: "staff-palm-sway-right 10s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 120 280" className="h-full w-full" fill="none">
          <path d="M60 280 L60 110" stroke="#DB3EB1" strokeWidth="7" strokeLinecap="round" />
          <path
            d="M60 100 C95 65 115 35 118 15 M60 105 C40 55 20 30 8 12"
            stroke="#DB3EB1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <svg
        className="absolute left-3 top-8 h-[70%] w-10 opacity-[0.05] md:left-6 md:w-12"
        viewBox="0 0 60 400"
        fill="none"
      >
        {[32, 72, 112, 152, 192, 232, 272, 312].map((y, i) => (
          <g key={i}>
            <rect x={14} y={y} width={22} height={14} rx={3} stroke="#41B6E6" strokeWidth="0.9" />
            <path
              d={`M25 ${y + 7} L20 ${y + 18} L28 ${y + 16} Z`}
              stroke="#41B6E6"
              strokeWidth="0.7"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
