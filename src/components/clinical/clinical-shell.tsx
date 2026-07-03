"use client";

import { RolePortalShell } from "@/components/role-portal-shell";
import type { ReactNode } from "react";

const NAV = [
  {
    href: "/clinical",
    label: "Consultation queue",
    description: "Patients after iPad intake",
    icon: "🩺",
  },
] as const;

export function ClinicalShell({
  userEmail,
  children,
}: {
  userEmail?: string | null;
  children: ReactNode;
}) {
  return (
    <RolePortalShell
      home="/clinical"
      portalName="Clinical Portal"
      footerNote="NP / MD access only — no billing"
      nav={NAV}
      userEmail={userEmail}
    >
      {children}
    </RolePortalShell>
  );
}
