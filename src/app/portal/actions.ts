"use server";

import { createPortalPacket } from "@/lib/intake-packet/form-persistence";
import { FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function startIntakePacket() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal");

  const { packetId } = await createPortalPacket(supabase, user.id);
  const first = FORM_ORDER[0];
  redirect(`/portal/packet/${packetId}/forms/${first}`);
}

/**
 * Stub server action for the legacy `portal-intake-form.tsx` component.
 * The real implementation should persist FormData into intake_packets / per-form tables.
 * Kept as a no-op so the build passes; Cursor will replace with real save logic.
 */
export async function submitPortalIntake(formData: FormData): Promise<void> {
  "use server";
  // TODO: implement actual save. For now, this exists only so the build succeeds.
  // Pull common identity values from formData and forward to createPortalPacket / per-form upsert.
  const _entries = Array.from(formData.entries());
  console.warn(
    `[submitPortalIntake] stub called with ${_entries.length} fields. Implement persistence.`,
  );
}
