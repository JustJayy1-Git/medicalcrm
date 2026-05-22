"use server";

import { createPortalPacket } from "@/lib/intake-packet/form-persistence";
import { FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { kioskSignInErrorMessage } from "@/lib/portal/device-auth";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { redirect } from "next/navigation";

/** Full-page redirect — works reliably on iPad Safari (fetch + cookies often fails). */
export async function startIntakePacket() {
  const { supabase, user, kioskFailure } = await createPortalClient();
  if (!user) {
    if (kioskFailure) {
      redirect(`/portal?error=${encodeURIComponent(kioskSignInErrorMessage(kioskFailure))}`);
    }
    redirect("/portal/login?next=/portal&error=device");
  }

  let packetId: number;
  try {
    ({ packetId } = await createPortalPacket(supabase, user.id));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start intake";
    redirect(`/portal?error=${encodeURIComponent(message)}`);
  }

  // redirect() must stay outside try/catch — it throws NEXT_REDIRECT internally.
  redirect(`/portal/packet/${packetId}/forms/${FORM_ORDER[0]}`);
}
