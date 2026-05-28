import { completePacket } from "@/lib/intake-packet/form-persistence";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

/** Finalize iPad intake → CRM patient chart, case, and file folder. */
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

  try {
    const result = await completePacket(packetId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not complete intake";
    console.error("complete intake packet:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
