import { auth } from "@/auth";
import { createPacket, listPackets } from "@/lib/form-persistence";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const packets = await listPackets();
  return NextResponse.json({ packets });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const created = await createPacket({
    patientName: body.patientName,
    dateOfBirth: body.dateOfBirth,
    phone: body.phone,
    email: body.email,
    dateOfAccident: body.dateOfAccident,
  });
  return NextResponse.json(created, { status: 201 });
}
