import { LogoMark } from "@/components/logo-mark";
import { PortalBackground } from "@/components/portal/portal-background";
import { StaffExitButton } from "@/components/portal/staff-exit-button";
import { StartIntakeForm } from "@/components/portal/start-intake-form";

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
      : error && !/next_redirect/i.test(error)
        ? decodeURIComponent(error)
        : null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0c0f15] px-6 py-12">
      <PortalBackground />

      <header className="absolute top-0 right-0 p-4 z-10">
        <StaffExitButton />
      </header>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full text-center">
        <LogoMark
          variant="header"
          width={140}
          height={140}
          priority
          className="mb-8"
        />

        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#41B6E6] mb-3">
          Pro Injury Medical &amp; Rehabilitation
        </p>

        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-tight mb-1">
          Patient Intake
        </h1>
        <p className="font-serif text-2xl md:text-3xl font-normal text-white/55 mb-8">
          Admisión del Paciente
        </p>

        <div className="w-24 h-0.5 bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] mb-8 rounded-full" />

        <p className="text-lg md:text-xl font-semibold text-white mb-1">
          New Patient
        </p>
        <p className="text-base text-[#41B6E6]/90 font-medium mb-6">Paciente Nuevo</p>

        <p className="text-[#c8d2e0]/90 text-base md:text-lg leading-relaxed mb-2">
          Thank you for choosing Pro Injury. We are grateful for your trust and look forward to caring for you.
        </p>
        <p className="text-[#c8d2e0]/65 text-sm md:text-base leading-relaxed mb-10 italic">
          Gracias por elegir Pro Injury. Agradecemos su confianza y esperamos poder atenderle.
        </p>

        {errorMessage ? (
          <p className="mb-6 px-4 py-3 text-sm text-red-200 bg-red-950/50 border border-red-900/50 rounded-xl max-w-sm text-center">
            {errorMessage}
          </p>
        ) : null}

        <StartIntakeForm />

        <p className="mt-10 text-[10px] text-[#c8d2e0]/35 text-center max-w-xs leading-relaxed">
          Staff: use the <span className="text-[#c8d2e0]/55">Staff</span> button (top right) and your PIN to exit kiosk mode.
        </p>
      </div>
    </div>
  );
}
