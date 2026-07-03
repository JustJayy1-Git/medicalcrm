"use client";

import { RolePortalShell } from "@/components/role-portal-shell";
import type { ReactNode } from "react";

const NAV = [
  {
    href: "/therapy",
    label: "Therapy queue",
    description: "Sessions & consent",
    icon: "💆",
  },
] as const;

export function TherapyShell({
  userEmail,
  children,
}: {
  userEmail?: string | null;
  children: ReactNode;
}) {
  return (
    <RolePortalShell
      home="/therapy"
      portalName="Therapy Portal"
      footerNote="Therapist access only — no billing"
      nav={NAV}
      userEmail={userEmail}
    >
      {children}
    </RolePortalShell>
  );
}
