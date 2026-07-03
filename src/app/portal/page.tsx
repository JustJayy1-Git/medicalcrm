import { LogoMark } from "@/components/logo-mark";
import { StaffLandingBackground } from "@/components/staff-landing-background";
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
    <div className="portal-landing relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#0c0f15] flex flex-col">
      <StaffLandingBackground />

      <header className="absolute top-0 right-0 p-3 z-10 shrink-0">
        <StaffExitButton />
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center min-h-0 w-full max-w-lg mx-auto px-5 py-3 text-center gap-[clamp(4px,1.2dvh,10px)]">
        <LogoMark
          variant="header"
          width={160}
          height={160}
          priority
          className="portal-landing-logo shrink-0 w-[min(160px,22dvh)] h-auto max-h-[22dvh] object-contain"
        />

        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#41B6E6] leading-tight">
          Pro Injury Medical &amp; Rehabilitation
        </p>

        <div className="leading-tight">
          <h1 className="font-serif text-[clamp(1.35rem,4.2dvh,2rem)] font-semibold text-white">
            Patient <span className="lux-gold-text">Intake</span>
          </h1>
          <p className="font-serif text-[clamp(1rem,3dvh,1.35rem)] text-white/55">
            Admisión del Paciente
          </p>
        </div>

        <div className="lux-hairline w-36 shrink-0" />

        <div className="leading-snug">
          <p className="text-[clamp(0.9rem,2.4dvh,1.05rem)] font-semibold text-white">
            New Patient · Paciente Nuevo
          </p>
        </div>

        <p className="text-[#c8d2e0]/90 text-[clamp(0.7rem,1.9dvh,0.85rem)] leading-snug max-w-sm">
          Thank you for choosing Pro Injury. We are grateful for your trust and look forward to caring for you.
        </p>
        <p className="text-[#c8d2e0]/65 text-[clamp(0.65rem,1.7dvh,0.8rem)] leading-snug max-w-sm italic -mt-1">
          Gracias por elegir Pro Injury. Agradecemos su confianza y esperamos poder atenderle.
        </p>

        {errorMessage ? (
          <p className="px-3 py-2 text-xs text-red-200 bg-red-950/50 border border-red-900/50 rounded-lg max-w-sm text-center shrink-0">
            {errorMessage}
          </p>
        ) : null}

        <StartIntakeForm />
      </div>

      <p className="relative z-10 shrink-0 pb-[max(8px,env(safe-area-inset-bottom))] px-6 text-[9px] text-[#c8d2e0]/35 text-center leading-tight">
        Staff: use <span className="text-[#c8d2e0]/55">Staff</span> (top right) and your PIN to exit kiosk mode.
      </p>
    </div>
  );
}
