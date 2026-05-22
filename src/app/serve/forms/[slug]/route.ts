import { isFormSlug } from "@/lib/intake-packet/form-slugs";
import { getFormBySlug } from "@/lib/intake-packet/forms-registry.server";
import { resolveFormsDir } from "@/lib/intake-packet/forms-path";
import { injectApiBridge } from "@/lib/intake-packet/html-bridge";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { slug } = await params;
  if (!isFormSlug(slug)) return new NextResponse("Not found", { status: 404 });

  const url = new URL(request.url);
  const packetId = url.searchParams.get("packetId");
  if (!packetId) return new NextResponse("packetId required", { status: 400 });

  const def = getFormBySlug(slug);
  const filePath = path.join(resolveFormsDir(), def.file);
  const html = fs.readFileSync(filePath, "utf8");
  const patched = injectApiBridge(html, {
    packetId,
    formSlug: slug,
    storeKey: def.localStorageKey,
    needsIntakePrefill: slug !== "intake",
  });

  return new NextResponse(patched, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
