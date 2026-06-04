import { completePacket } from "@/lib/intake-packet/form-persistence";
import { LogoMark } from "@/components/logo-mark";
import { StaffLandingBackground } from "@/components/staff-landing-background";
import { StaffExitButton } from "@/components/portal/staff-exit-button";
import Link from "next/link";

export default async function PortalDonePage({
  searchParams,
}: {
  searchParams: Promise<{ packet?: string }>;
}) {
  const { packet } = await searchParams;
  const packetId = packet ? Number(packet) : NaN;

  let completeError: string | null = null;
  if (Number.isFinite(packetId)) {
    try {
      await completePacket(packetId);
    } catch (err) {
      completeError =
        err instanceof Error ? err.message : "Could not complete intake";
      console.error("portal/done completePacket:", err);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0c0f15] px-6 text-center">
      <StaffLandingBackground />
      <header className="absolute top-0 right-0 p-4 z-10">
        <StaffExitButton />
      </header>
      <div className="relative z-10 flex flex-col items-center">
        <LogoMark
          variant="header"
          width={200}
          height={200}
          className="mb-6 w-[min(240px,65vw)] h-auto max-w-[280px]"
        />
        <h1 className="text-3xl font-serif text-white mb-3">Thank you</h1>
        {completeError ? (
          <p className="text-[#ffb4d0] max-w-md mb-6 text-sm leading-relaxed">
            {completeError} Go back and complete missing signatures, dates, and names,
            then tap Finish again.
          </p>
        ) : (
          <p className="text-[#c8d2e0]/75 max-w-md mb-10">
            Your intake forms have been submitted. Please return the iPad to the front desk.
          </p>
        )}
        {completeError && Number.isFinite(packetId) ? (
          <Link
            href={`/portal/packet/${packetId}/forms/records`}
            className="px-10 py-3 font-bold rounded-xl bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white mb-4 inline-block"
          >
            Return to intake
          </Link>
        ) : null}
        <Link
          href="/portal"
          className="px-10 py-3 font-bold rounded-xl border border-[#41B6E6]/50 text-[#c8d2e0] hover:text-white inline-block"
        >
          Start next patient
        </Link>
      </div>
    </div>
  );
}
