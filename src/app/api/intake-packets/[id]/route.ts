import { loadPacketForms } from "@/lib/intake-packet/form-persistence";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  const loaded = await loadPacketForms(supabase, packetId);
  return NextResponse.json(loaded);
}
