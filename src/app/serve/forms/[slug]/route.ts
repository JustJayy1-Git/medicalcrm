import { isFormSlug } from "@/lib/intake-packet/form-slugs";
import { loadForm } from "@/lib/intake-packet/form-persistence";
import { getFormBySlug } from "@/lib/intake-packet/forms-registry.server";
import { resolveFormsDir } from "@/lib/intake-packet/forms-path";
import { injectApiBridge } from "@/lib/intake-packet/html-bridge";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { supabase, user } = await createPortalClient();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { slug } = await params;
  if (!isFormSlug(slug)) return new NextResponse("Not found", { status: 404 });

  const url = new URL(request.url);
  const packetId = url.searchParams.get("packetId");
  if (!packetId) return new NextResponse("packetId required", { status: 400 });
  const portalMode = url.searchParams.get("portal") === "1";

  // Load saved answers server-side so the form renders prefilled even when
  // client-side fetching is unavailable (e.g. printing the whole packet).
  let initialData: { cached: Record<string, unknown>; intake: Record<string, unknown> } | undefined;
  const packetNum = Number(packetId);
  if (Number.isFinite(packetNum)) {
    try {
      const cached = await loadForm(supabase, packetNum, slug);
      const intake =
        slug === "intake" ? cached : await loadForm(supabase, packetNum, "intake");
      initialData = { cached, intake };
    } catch (err) {
      console.error("serve/forms initial data:", err);
    }
  }

  const def = getFormBySlug(slug);
  const filePath = path.join(resolveFormsDir(), def.file);
  const html = fs.readFileSync(filePath, "utf8");
  const patched = injectApiBridge(html, {
    packetId,
    formSlug: slug,
    storeKey: def.localStorageKey,
    needsIntakePrefill: slug !== "intake",
    portalMode,
    initialData,
  });

  return new NextResponse(patched, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
