"use client";

import { useId } from "react";

/** Filled coconut-palm silhouette — postcard-style, not line art. */
export function PalmSilhouette({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const fillId = `palm-fill-${uid}`;
  const highlightId = `palm-hi-${uid}`;

  return (
    <svg
      viewBox="0 0 200 420"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3a4a" />
          <stop offset="45%" stopColor="#0f2430" />
          <stop offset="100%" stopColor="#0c0f15" />
        </linearGradient>
        <linearGradient id={highlightId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#41B6E6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#41B6E6" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M94 420 C90 340 98 260 96 190 C94 150 100 115 98 88 C96 72 102 58 100 48 C98 42 104 38 100 34 L108 34 C110 40 106 48 108 58 C110 72 104 88 106 102 C108 130 102 165 104 200 C106 280 98 350 102 420 Z"
        fill={`url(#${fillId})`}
      />
      <path
        d="M100 200 C98 260 102 330 100 400"
        stroke={`url(#${highlightId})`}
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />

      <g fill={`url(#${fillId})`}>
        <path d="M100 42 C55 8 18 0 4 18 C28 22 55 32 78 42 C62 28 48 12 100 42 Z" />
        <path d="M100 40 C72 2 42 0 26 14 C48 18 72 28 92 38 C80 24 68 10 100 40 Z" />
        <path d="M100 44 C38 22 8 38 2 58 C22 48 48 42 72 44 C52 32 36 18 100 44 Z" />
        <path d="M100 38 C145 6 178 2 192 16 C168 20 142 30 118 40 C132 26 148 12 100 38 Z" />
        <path d="M100 42 C168 18 196 36 198 56 C176 46 150 40 126 42 C146 30 162 16 100 42 Z" />
        <path d="M100 46 C155 48 188 68 194 88 C170 72 145 58 120 50 C140 62 158 78 100 46 Z" />
        <path d="M100 36 C128 4 158 8 172 28 C148 24 124 32 104 36 C118 20 132 8 100 36 Z" />
        <path d="M100 34 C88 0 108 0 118 20 C108 18 98 26 100 34 Z" />
      </g>
      <g stroke="#41B6E6" strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.25">
        <path d="M100 42 C55 8 18 0 4 18" />
        <path d="M100 38 C145 6 178 2 192 16" />
        <path d="M100 44 C38 22 8 38 2 58" />
        <path d="M100 42 C168 18 196 36 198 56" />
      </g>
    </svg>
  );
}
