"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/patients", label: "Patients", icon: "👥" },
  { href: "/intake-packets", label: "Intake packets", icon: "📝" },
  { href: "/cases", label: "Cases", icon: "📁" },
  { href: "/providers", label: "Providers", icon: "🩺" },
  { href: "/facilities", label: "Facilities", icon: "🏥" },
  { href: "/insurance", label: "Insurance", icon: "🛡️" },
  { href: "/attorneys", label: "Attorneys", icon: "⚖️" },
  { href: "/templates", label: "Templates", icon: "📋" },
  { href: "/billing", label: "Billing", icon: "💰" },
  { href: "/claims", label: "Claims", icon: "🧾" },
  { href: "/reports", label: "Reports", icon: "📊" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  user,
  children,
}: {
  user: { email?: string | null };
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-vice-surface text-eggplant-950">
      {/* Aubergine sidebar — Wynwood chrome */}
      <aside className="w-60 shrink-0 flex flex-col bg-gradient-to-b from-eggplant-950 via-eggplant-900 to-eggplant-800 border-r border-neon-pink/25 shadow-[4px_0_28px_rgba(255,45,138,0.12)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-4 border-b border-neon-pink/20 hover:bg-white/5 transition-colors"
        >
          <Image
            src="/logo-emblem.png"
            alt="Pro Injury"
            width={36}
            height={36}
            priority
            className="rounded p-0.5 ring-2 ring-neon-mint/50"
          />
          <span className="text-xl font-sans font-extrabold italic tracking-tight text-white border-b-2 border-neon-pink pb-0.5 drop-shadow-[0_0_8px_rgba(255,45,138,0.5)]">
            CRM
          </span>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const isActive = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={[
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                  isActive
                    ? "bg-neon-mint/15 text-neon-mint border-l-2 border-neon-mint font-semibold shadow-[inset_0_0_20px_rgba(0,245,196,0.08)]"
                    : "text-white/55 hover:text-neon-mint hover:bg-white/5 border-l-2 border-transparent",
                ].join(" ")}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-neon-pink/15 text-xs text-white/35">
          v0.1 · Pro Injury
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Aubergine top bar */}
        <header className="flex items-center gap-4 px-6 py-3 bg-eggplant-900 border-b border-neon-pink/30 shadow-[0_4px_24px_rgba(26,15,36,0.4)]">
          <div className="flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search patients, cases, claims…"
              className="w-full px-4 py-2 bg-eggplant-800/80 border border-neon-mint/25 rounded-lg text-sm text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-neon-mint/50 focus:border-neon-mint"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {user.email ? (
              <span className="text-xs text-neon-mint/80 hidden sm:inline truncate max-w-[200px]">
                {user.email}
              </span>
            ) : null}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs border border-neon-pink/60 text-neon-pink rounded-md hover:bg-neon-pink/15 hover:shadow-[0_0_12px_rgba(255,45,138,0.3)] transition-all"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-vice-surface">{children}</main>
      </div>
    </div>
  );
}
