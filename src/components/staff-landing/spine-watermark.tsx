"use client";

import { useId, type CSSProperties } from "react";

/** Subtle posterior spine silhouette — medical, not sci-fi. */
export function SpineWatermark({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const fadeId = `spine-fade-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 100 320"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#41B6E6" stopOpacity="0" />
          <stop offset="15%" stopColor="#41B6E6" stopOpacity="0.12" />
          <stop offset="85%" stopColor="#41B6E6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#41B6E6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill={`url(#${fadeId})`}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => {
          const y = 24 + i * 20;
          const w = 28 + (i < 7 ? i * 1.2 : (13 - i) * 1.2);
          return (
            <g key={i}>
              <rect
                x={50 - w / 2}
                y={y}
                width={w}
                height={14}
                rx={4}
                fill="#41B6E6"
                opacity="0.35"
              />
              <path
                d={`M50 ${y + 6} L50 ${y + 22} L46 ${y + 26} L54 ${y + 26} Z`}
                fill="#7ecff0"
                opacity="0.25"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
