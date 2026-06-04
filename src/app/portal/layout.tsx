import { KioskGuard } from "@/components/portal/kiosk-guard";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden">
      <KioskGuard>{children}</KioskGuard>
    </div>
  );
}
