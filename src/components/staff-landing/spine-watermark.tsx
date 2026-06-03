"use client";

import { useId, type CSSProperties } from "react";

/** Single spine following natural S-curve (cervical / thoracic / lumbar). */
export function SpineWatermark({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const fadeId = `spine-fade-${useId().replace(/:/g, "")}`;

  /** Vertebra centers along an S-shaped column (lateral view). */
  const levels: Array<{ cx: number; cy: number; w: number; rot: number }> = [
    { cx: 54, cy: 22, w: 22, rot: -14 },
    { cx: 48, cy: 42, w: 24, rot: -18 },
    { cx: 44, cy: 62, w: 26, rot: -12 },
    { cx: 42, cy: 82, w: 28, rot: -6 },
    { cx: 44, cy: 102, w: 30, rot: 2 },
    { cx: 48, cy: 122, w: 32, rot: 10 },
    { cx: 54, cy: 142, w: 34, rot: 16 },
    { cx: 58, cy: 162, w: 36, rot: 14 },
    { cx: 56, cy: 182, w: 38, rot: 8 },
    { cx: 50, cy: 202, w: 40, rot: 0 },
    { cx: 44, cy: 222, w: 40, rot: -8 },
    { cx: 40, cy: 242, w: 38, rot: -14 },
    { cx: 42, cy: 262, w: 36, rot: -10 },
    { cx: 48, cy: 282, w: 34, rot: -4 },
    { cx: 54, cy: 302, w: 32, rot: 6 },
    { cx: 58, cy: 322, w: 30, rot: 12 },
  ];

  return (
    <svg
      viewBox="0 0 100 360"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#41B6E6" stopOpacity="0" />
          <stop offset="12%" stopColor="#41B6E6" stopOpacity="0.14" />
          <stop offset="88%" stopColor="#41B6E6" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#41B6E6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* S-curve guide (very faint) */}
      <path
        d="M54 18 C44 70 62 130 48 190 C38 250 56 300 54 340"
        stroke="#41B6E6"
        strokeWidth="0.75"
        fill="none"
        opacity="0.12"
        strokeDasharray="3 5"
      />

      <g fill={`url(#${fadeId})`}>
        {levels.map((v, i) => (
          <g
            key={i}
            transform={`rotate(${v.rot} ${v.cx} ${v.cy})`}
          >
            <rect
              x={v.cx - v.w / 2}
              y={v.cy - 7}
              width={v.w}
              height={14}
              rx={4}
              fill="#41B6E6"
              opacity="0.32"
            />
            <path
              d={`M${v.cx} ${v.cy + 2} L${v.cx} ${v.cy + 18} L${v.cx - 4} ${v.cy + 22} L${v.cx + 4} ${v.cy + 22} Z`}
              fill="#7ecff0"
              opacity="0.22"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
