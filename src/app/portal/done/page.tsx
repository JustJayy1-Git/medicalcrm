import { completePacket } from "@/lib/intake-packet/form-persistence";
import { StaffExitButton } from "@/components/portal/staff-exit-button";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function PortalDonePage({
  searchParams,
}: {
  searchParams: Promise<{ packet?: string }>;
}) {
  const { packet } = await searchParams;
  const packetId = packet ? Number(packet) : NaN;

  if (Number.isFinite(packetId)) {
    const supabase = await createClient();
    await completePacket(supabase, packetId);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-eggplant-950 to-[#1a1d24] px-6 text-center">
      <header className="absolute top-0 right-0 p-4">
        <StaffExitButton />
      </header>
      <Image src="/logo.png" alt="Pro Injury" width={80} height={80} className="mb-6" />
      <h1 className="text-3xl font-serif text-white mb-3">Thank you</h1>
      <p className="text-white/65 max-w-md mb-10">
        Your intake forms have been submitted. Please return the iPad to the front desk.
      </p>
      <Link
        href="/portal"
        className="px-10 py-3 font-bold rounded-xl bg-gradient-to-r from-neon-mint to-neon-pink text-eggplant-950"
      >
        Start next patient
      </Link>
    </div>
  );
}
