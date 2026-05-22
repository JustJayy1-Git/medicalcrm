import { StaffExitButton } from "@/components/portal/staff-exit-button";
import { StartIntakeButton } from "@/components/portal/start-intake-button";
import Image from "next/image";

export default function PortalHomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-eggplant-950 via-eggplant-900 to-[#1a1d24] px-6">
      <header className="absolute top-0 right-0 p-4">
        <StaffExitButton />
      </header>

      <Image src="/logo.png" alt="Pro Injury" width={96} height={96} priority className="mb-6" />
      <h1 className="text-3xl md:text-4xl font-serif font-semibold text-white text-center mb-3">
        Patient intake
      </h1>
      <p className="text-white/60 text-center max-w-md mb-2 text-lg">
        New patient?
      </p>
      <p className="text-white/45 text-center max-w-md mb-10 text-sm">
        Tap below to start the 8 intake forms. No login needed.
      </p>

      <StartIntakeButton />

      <p className="mt-8 text-xs text-white/35 text-center max-w-sm">
        Staff: use the <span className="text-white/50">Staff</span> button (top right) and your PIN to
        exit kiosk mode.
      </p>
    </div>
  );
}
