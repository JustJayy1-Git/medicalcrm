/** Miami sunset — warm disc + soft beams (no spinning rays). */
export function SunsetSun({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden>
      <defs>
        <radialGradient id="sun-disc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE8A8" />
          <stop offset="35%" stopColor="#FFB84D" />
          <stop offset="70%" stopColor="#FF8F5C" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#DB3EB1" stopOpacity="0.15" />
        </radialGradient>
        <linearGradient id="sun-beam" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FFB84D" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFB84D" stopOpacity="0" />
        </linearGradient>
        <filter id="sun-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <g opacity="0.45" filter="url(#sun-blur)">
        <path d="M160 95 L40 20 L80 95 Z" fill="url(#sun-beam)" />
        <path d="M160 95 L120 8 L160 95 Z" fill="url(#sun-beam)" />
        <path d="M160 95 L200 8 L160 95 Z" fill="url(#sun-beam)" />
        <path d="M160 95 L280 20 L240 95 Z" fill="url(#sun-beam)" />
        <path d="M160 95 L20 70 L70 95 Z" fill="url(#sun-beam)" opacity="0.7" />
        <path d="M160 95 L300 70 L250 95 Z" fill="url(#sun-beam)" opacity="0.7" />
      </g>

      <ellipse
        cx="160"
        cy="98"
        rx="72"
        ry="68"
        fill="#FF8F5C"
        opacity="0.2"
        className="staff-anim-sun-glow"
      />
      <circle cx="160" cy="98" r="52" fill="url(#sun-disc)" />
      <circle cx="160" cy="98" r="48" stroke="#FFE8A8" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}
