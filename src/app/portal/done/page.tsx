import { completePacket } from "@/lib/intake-packet/form-persistence";
import { LogoMark } from "@/components/logo-mark";
import { PortalBackground } from "@/components/portal/portal-background";
import { StaffExitButton } from "@/components/portal/staff-exit-button";
import Link from "next/link";

export default async function PortalDonePage({
  searchParams,
}: {
  searchParams: Promise<{ packet?: string }>;
}) {
  const { packet } = await searchParams;
  const packetId = packet ? Number(packet) : NaN;

  if (Number.isFinite(packetId)) {
    try {
      await completePacket(packetId);
    } catch (err) {
      console.error("portal/done completePacket:", err);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0c0f15] px-6 text-center">
      <PortalBackground />
      <header className="absolute top-0 right-0 p-4 z-10">
        <StaffExitButton />
      </header>
      <div className="relative z-10 flex flex-col items-center">
        <LogoMark variant="header" width={100} height={100} className="mb-6" />
        <h1 className="text-3xl font-serif text-white mb-3">Thank you</h1>
        <p className="text-[#c8d2e0]/75 max-w-md mb-10">
          Your intake forms have been submitted. Please return the iPad to the front desk.
        </p>
        <Link
          href="/portal"
          className="px-10 py-3 font-bold rounded-xl bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white"
        >
          Start next patient
        </Link>
      </div>
    </div>
  );
}
