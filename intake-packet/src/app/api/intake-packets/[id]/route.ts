import { auth } from "@/auth";
import { getPacketMeta, loadPacketForms } from "@/lib/form-persistence";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  const meta = await getPacketMeta(packetId);
  if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const loaded = await loadPacketForms(packetId);
  return NextResponse.json({
    packet: meta,
    forms: loaded.forms,
    intakeKey: "proInjury.intake.v1",
  });
}
