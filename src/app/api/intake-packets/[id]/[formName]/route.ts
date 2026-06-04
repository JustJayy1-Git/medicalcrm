import { isFormSlug } from "@/lib/intake-packet/form-slugs";
import { formatDbError, loadForm, saveForm } from "@/lib/intake-packet/form-persistence";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string; formName: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { supabase, user } = await createPortalClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, formName } = await params;
  if (!isFormSlug(formName)) {
    return NextResponse.json({ error: "Unknown form" }, { status: 404 });
  }

  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  const data = await loadForm(supabase, packetId, formName);
  return NextResponse.json({ form: formName, data });
}

export async function POST(request: Request, { params }: Params) {
  const { supabase, user } = await createPortalClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, formName } = await params;
  if (!isFormSlug(formName)) {
    return NextResponse.json({ error: "Unknown form" }, { status: 404 });
  }

  const packetId = Number(id);
  if (!Number.isFinite(packetId)) {
    return NextResponse.json({ error: "Invalid packet id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = await saveForm(supabase, packetId, formName, body);
    return NextResponse.json({ form: formName, data });
  } catch (err) {
    console.error("intake form save:", formName, err);
    return NextResponse.json({ error: formatDbError(err) }, { status: 500 });
  }
}
