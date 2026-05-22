import { StaffExitButton } from "@/components/portal/staff-exit-button";
import Image from "next/image";
import { startIntakePacket } from "./actions";

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
      <p className="text-white/60 text-center max-w-md mb-10">
        Tap below to begin your forms. Your answers save automatically as you go.
      </p>

      <form action={startIntakePacket}>
        <button
          type="submit"
          className="px-14 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-neon-mint to-neon-pink text-eggplant-950 shadow-lg hover:brightness-110 transition"
        >
          Start intake
        </button>
      </form>

      <p className="mt-8 text-xs text-white/35 text-center max-w-sm">
        Staff: use the <span className="text-white/50">Staff</span> button (top right) and your PIN to
        exit kiosk mode.
      </p>
    </div>
  );
}
