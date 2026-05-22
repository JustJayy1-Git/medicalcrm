import { auth } from "@/auth";
import { isFormSlug } from "@/lib/forms-registry";
import { loadForm, saveForm } from "@/lib/form-persistence";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string; formName: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, formName } = await params;
  if (!isFormSlug(formName)) {
    return NextResponse.json({ error: "Unknown form" }, { status: 404 });
  }

  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  const data = await loadForm(packetId, formName);
  return NextResponse.json({ form: formName, data });
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, formName } = await params;
  if (!isFormSlug(formName)) {
    return NextResponse.json({ error: "Unknown form" }, { status: 404 });
  }

  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  const body = await request.json();
  const data = await saveForm(packetId, formName, body);
  return NextResponse.json({ form: formName, data });
}
