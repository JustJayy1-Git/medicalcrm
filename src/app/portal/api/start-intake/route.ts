import { createPortalPacket } from "@/lib/intake-packet/form-persistence";
import { FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { kioskSignInErrorMessage } from "@/lib/portal/device-auth";
import { NextResponse } from "next/server";

/** Starts a new 8-page intake packet for the iPad (kiosk session only). */
export async function POST() {
  const { supabase, user, kioskFailure } = await createPortalClient();
  if (!user) {
    return NextResponse.json(
      {
        error: kioskFailure
          ? kioskSignInErrorMessage(kioskFailure)
          : "Kiosk not configured. Add KIOSK_DEVICE_EMAIL and KIOSK_DEVICE_PASSWORD in Vercel (kiosk user, role=kiosk), then redeploy.",
        code: kioskFailure ?? "KIOSK_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  try {
    const { packetId } = await createPortalPacket(supabase, user.id);
    const first = FORM_ORDER[0];
    return NextResponse.json({ url: `/portal/packet/${packetId}/forms/${first}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start intake";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
