"use client";

import { LogoMark } from "@/components/logo-mark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/clinical", label: "Consultation queue", icon: "📋" },
] as const;

export function ClinicalShell({
  userEmail,
  children,
}: {
  userEmail?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[#0c0f15] text-[#e8edf4]">
      <aside className="w-64 shrink-0 flex flex-col border-r border-[#c9a35c]/25 bg-[#0c0f15]">
        <Link href="/clinical" className="flex items-center gap-3 px-4 py-4">
          <LogoMark variant="header" width={48} height={48} className="w-12 h-12" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#41B6E6]">
              Pro Injury
            </p>
            <p className="lux-gold-text text-sm font-serif font-semibold tracking-wide">Clinical Portal</p>
          </div>
        </Link>
        <div className="lux-hairline mx-3" aria-hidden />
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/clinical"
                ? pathname === "/clinical"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-[#41B6E6]/25 to-[#DB3EB1]/20 text-white border border-[#41B6E6]/40"
                    : "text-[#c8d2e0]/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="lux-hairline mx-3" aria-hidden />
        <div className="p-4 text-[10px] text-[#c8d2e0]/50">
          <p className="truncate">{userEmail ?? "Signed in"}</p>
          <p className="mt-1">NP / MD access only — no billing</p>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
