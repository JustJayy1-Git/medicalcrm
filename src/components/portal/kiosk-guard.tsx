"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PORTAL_PREFIX = "/portal";

/** Keeps kiosk sessions inside the portal; blocks back-navigation escape. */
export function KioskGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname.startsWith(PORTAL_PREFIX)) {
      router.replace("/portal");
    }
  }, [pathname, router]);

  useEffect(() => {
    const trap = () => {
      window.history.pushState({ kiosk: true }, "", window.location.href);
    };
    trap();
    window.addEventListener("popstate", trap);
    return () => window.removeEventListener("popstate", trap);
  }, [pathname]);

  useEffect(() => {
    const blockLeave = (e: BeforeUnloadEvent) => {
      if (!pathname.startsWith(PORTAL_PREFIX)) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", blockLeave);
    return () => window.removeEventListener("beforeunload", blockLeave);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      if (href.startsWith(PORTAL_PREFIX) || href.startsWith("/serve/forms/")) return;
      if (href.startsWith("/portal/login") || href.startsWith("/auth/")) return;
      e.preventDefault();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return <>{children}</>;
}
