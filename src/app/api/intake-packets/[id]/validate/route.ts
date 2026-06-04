import { validatePortalPacket } from "@/lib/intake-packet/intake-packet-validation";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { user } = await createPortalClient();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await validatePortalPacket(admin, packetId);
  return NextResponse.json(result);
}
