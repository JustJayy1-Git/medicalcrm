import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const expected = process.env.KIOSK_EXIT_PIN;
  if (!expected) {
    return NextResponse.json(
      { error: "KIOSK_EXIT_PIN is not configured on the server" },
      { status: 503 },
    );
  }

  const { pin } = await request.json();
  if (pin !== expected) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
