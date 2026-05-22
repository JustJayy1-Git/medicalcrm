import { KioskGuard } from "@/components/portal/kiosk-guard";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <KioskGuard>{children}</KioskGuard>;
}
