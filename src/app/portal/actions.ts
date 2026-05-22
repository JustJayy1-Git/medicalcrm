"use server";

import { createPortalPacket } from "@/lib/intake-packet/form-persistence";
import { FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { redirect } from "next/navigation";

/** Full-page redirect — works reliably on iPad Safari (fetch + cookies often fails). */
export async function startIntakePacket() {
  const { supabase, user } = await createPortalClient();
  if (!user) {
    const hasDeviceCreds = Boolean(
      process.env.KIOSK_DEVICE_EMAIL?.trim() && process.env.KIOSK_DEVICE_PASSWORD,
    );
    if (hasDeviceCreds) {
      redirect(
        `/portal?error=${encodeURIComponent("Kiosk sign-in failed. Check that the kiosk user exists in Supabase and has role=kiosk.")}`,
      );
    }
    redirect("/portal/login?next=/portal&error=device");
  }

  try {
    const { packetId } = await createPortalPacket(supabase, user.id);
    const first = FORM_ORDER[0];
    redirect(`/portal/packet/${packetId}/forms/${first}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start intake";
    redirect(`/portal?error=${encodeURIComponent(message)}`);
  }
}
