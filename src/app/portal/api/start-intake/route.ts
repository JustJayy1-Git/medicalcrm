import { createPortalPacket } from "@/lib/intake-packet/form-persistence";
import { FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { NextResponse } from "next/server";

/** Starts a new 8-page intake packet for the iPad (kiosk session only). */
export async function POST() {
  const { supabase, user } = await createPortalClient();
  if (!user) {
    return NextResponse.json(
      { error: "Kiosk device is not configured. Set KIOSK_DEVICE_EMAIL and KIOSK_DEVICE_PASSWORD on the server." },
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
