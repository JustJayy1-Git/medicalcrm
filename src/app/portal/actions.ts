"use server";

import { createPortalPacket } from "@/lib/intake-packet/form-persistence";
import { FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { ensurePortalUser } from "@/lib/portal/device-auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function startIntakePacket() {
  const supabase = await createClient();
  const user = await ensurePortalUser(supabase);
  if (!user) redirect("/portal/login?next=/portal");

  const { packetId } = await createPortalPacket(supabase, user.id);
  const first = FORM_ORDER[0];
  redirect(`/portal/packet/${packetId}/forms/${first}`);
}
