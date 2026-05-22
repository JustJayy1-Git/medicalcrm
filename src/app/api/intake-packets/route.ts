import { createPortalPacket, listPackets } from "@/lib/intake-packet/form-persistence";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const packets = await listPackets(supabase);
  return NextResponse.json({ packets });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const created = await createPortalPacket(supabase, user.id);
  return NextResponse.json(created, { status: 201 });
}
