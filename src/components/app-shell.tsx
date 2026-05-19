import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/patients", label: "Patients", icon: "👥" },
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

export function AppShell({
  user,
  active,
  children,
}: {
  user: { email?: string | null };
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-stone-50 text-stone-800">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-stone-200 bg-stone-100 flex flex-col">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-4 border-b border-stone-200 hover:bg-stone-200/50 transition-colors"
        >
          <Image
            src="/logo-emblem.png"
            alt="Pro Injury"
            width={36}
            height={36}
            priority
            className="bg-stone-900 rounded p-0.5"
          />
          <span className="text-xl font-sans font-extrabold italic tracking-tight text-stone-900 border-b-2 border-amber-600 pb-0.5">
            CRM
          </span>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-amber-100 text-amber-900 border-l-2 border-amber-600 font-medium"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60",
                ].join(" ")}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-stone-200 text-xs text-stone-500">
          v0.1 · Pro Injury
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-stone-200 bg-white">
          <div className="flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search patients, cases, claims… (press /)"
              className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs border border-stone-300 text-stone-600 rounded-md hover:bg-stone-100 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
