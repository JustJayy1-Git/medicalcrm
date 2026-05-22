import { StaffExitButton } from "@/components/portal/staff-exit-button";
import { StartIntakeForm } from "@/components/portal/start-intake-form";
import Image from "next/image";

const DEVICE_SETUP_HINT =
  "Intake could not start. Ask front desk to set KIOSK_DEVICE_EMAIL and KIOSK_DEVICE_PASSWORD in Vercel (kiosk user with role=kiosk), then redeploy.";

export default async function PortalHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const errorMessage =
    error === "device"
      ? DEVICE_SETUP_HINT
      : error
        ? decodeURIComponent(error)
        : null;

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
      <p className="text-white/45 text-center max-w-md mb-6 text-sm">
        Tap below to start the 8 intake forms. No login needed.
      </p>

      {errorMessage ? (
        <p className="mb-4 px-4 py-3 text-sm text-red-200 bg-red-950/50 border border-red-900/50 rounded-xl max-w-sm text-center">
          {errorMessage}
        </p>
      ) : null}

      <StartIntakeForm />

      <p className="mt-8 text-xs text-white/35 text-center max-w-sm">
        Staff: use the <span className="text-white/50">Staff</span> button (top right) and your PIN to
        exit kiosk mode.
      </p>
    </div>
  );
}
