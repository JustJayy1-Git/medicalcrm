import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") ?? "30", 10) || 30,
    100,
  );

  let query = supabase
    .from("icd_codes")
    .select("code, description")
    .eq("is_active", true)
    .order("code", { ascending: true })
    .limit(limit);

  if (q) {
    // Search by code prefix OR description (case-insensitive)
    query = query.or(
      `code.ilike.${q}%,description.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}
