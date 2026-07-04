"use client";

import { LogoMark } from "@/components/logo-mark";
import { StaffCrmSideAccents } from "@/components/staff-crm-side-accents";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", description: "Overview & daily stats", icon: "🏠" },
  { href: "/patients", label: "Patients", description: "Charts & demographics", icon: "👥" },
  { href: "/intake-packets", label: "Intake packets", description: "iPad form submissions", icon: "📝" },
  { href: "/providers", label: "Providers", description: "Doctors & clinicians", icon: "🩺" },
  { href: "/facilities", label: "Facilities", description: "Locations & offices", icon: "🏥" },
  { href: "/insurance", label: "Insurance", description: "Carriers & policies", icon: "🛡️" },
  { href: "/attorneys", label: "Attorneys", description: "Law firms & LOP", icon: "⚖️" },
  { href: "/templates", label: "Templates", description: "Document library", icon: "📋" },
  { href: "/billing", label: "Billing", description: "Charges & ledgers", icon: "💰" },
  { href: "/billing/payments", label: "Payments", description: "Post & apply payments", icon: "💳" },
  { href: "/claims", label: "Claims", description: "Insurance claims", icon: "🧾" },
  { href: "/reports", label: "Reports", description: "Ledgers & CMS-1500", icon: "📊" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/billing") {
    return (
      pathname === "/billing" ||
      (pathname.startsWith("/billing/") &&
        !pathname.startsWith("/billing/payments"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
}: {
  user?: { email?: string | null };
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-vice-surface text-eggplant-950">
      <aside className="w-[17.5rem] shrink-0 flex flex-col bg-gradient-to-b from-[#0c0f15] via-[#121820] to-[#1a2330] border-r border-[#c9a35c]/25 shadow-[4px_0_32px_rgba(201,163,92,0.10)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-5 hover:bg-white/[0.03] transition-colors"
        >
          <LogoMark
            variant="icon"
            width={60}
            height={60}
            priority
            className="shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#41B6E6] leading-none mb-1">
              Medical CRM
            </p>
            <span className="lux-gold-text block text-xl font-serif font-bold tracking-[0.14em] leading-tight">
              LUKARIENZ
            </span>
          </div>
        </Link>
        <div className="lux-hairline mx-4" aria-hidden />

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={[
                  "flex items-start gap-3 px-3.5 py-3 rounded-lg transition-all border-l-[3px]",
                  isActive
                    ? "bg-[#41B6E6]/12 text-white border-[#41B6E6] shadow-[inset_0_0_24px_rgba(65,182,230,0.08)]"
                    : "text-white/55 hover:text-white hover:bg-white/[0.04] border-transparent",
                ].join(" ")}
              >
                <span className="text-xl leading-none mt-0.5 shrink-0 w-7 text-center" aria-hidden>
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] leading-tight ${isActive ? "font-bold" : "font-semibold"}`}>
                    {item.label}
                  </span>
                  <span className={`block text-[11px] mt-0.5 leading-snug ${isActive ? "text-[#41B6E6]/80" : "text-white/35"}`}>
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="lux-hairline mx-4" aria-hidden />
        <div className="px-5 py-4 text-[11px] text-white/30 leading-relaxed">
          <span className="lux-gold-text font-serif font-semibold tracking-[0.18em]">LUKARIENZ</span>
          <span className="text-white/25"> · v0.1</span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="relative flex items-center gap-4 px-6 py-3.5 bg-gradient-to-r from-[#121820] to-[#1a2330] shadow-[0_4px_24px_rgba(12,15,21,0.35)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#e6c987]/70 after:to-transparent">
          <div className="flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search patients, cases, claims…"
              className="w-full px-4 py-2.5 bg-[#0c0f15]/80 border border-[#41B6E6]/25 rounded-lg text-sm text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-[#41B6E6]/45 focus:border-[#41B6E6]"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold border border-[#DB3EB1]/55 text-[#e878c8] rounded-md hover:bg-[#DB3EB1]/12 hover:shadow-[0_0_14px_rgba(219,62,177,0.25)] transition-all"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="lux-surface relative flex-1 overflow-auto bg-vice-surface">
          <StaffCrmSideAccents />
          <div className="relative z-[1]">{children}</div>
        </main>
      </div>
    </div>
  );
}
