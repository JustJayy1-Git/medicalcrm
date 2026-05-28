"use client";

/** Decorative Miami Vice background for iPad portal screens. */
export function PortalBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -8%, #41B6E6 0%, transparent 58%), radial-gradient(ellipse 65% 45% at 100% 100%, #DB3EB1 0%, transparent 52%), radial-gradient(ellipse 55% 40% at 0% 85%, #41B6E6 0%, transparent 48%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #fff 1px, transparent 1px), linear-gradient(45deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px, 48px 48px",
        }}
      />
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#41B6E6]/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[#DB3EB1]/12 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-[120%] opacity-[0.06]">
        <svg viewBox="0 0 1200 200" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M0,120 C200,40 400,180 600,100 C800,20 1000,140 1200,80 L1200,200 L0,200 Z"
            fill="#41B6E6"
          />
          <path
            d="M0,160 C300,80 500,200 800,120 C950,80 1100,160 1200,130 L1200,200 L0,200 Z"
            fill="#DB3EB1"
            opacity="0.7"
          />
        </svg>
      </div>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2341B6E6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#41B6E6]/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#DB3EB1]/50 to-transparent" />
    </div>
  );
}
