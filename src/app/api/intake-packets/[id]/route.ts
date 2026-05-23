import { loadPacketForms } from "@/lib/intake-packet/form-persistence";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { supabase, user } = await createPortalClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  const loaded = await loadPacketForms(supabase, packetId);
  return NextResponse.json(loaded);
}
