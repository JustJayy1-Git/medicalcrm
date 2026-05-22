import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAllClaimsForCase,
  fetchClaimsForCaseDos,
} from "@/lib/cms1500/fetch";
import { generateFilledCms1500Pdf } from "@/lib/cms1500/pdf-fill";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const caseId = url.searchParams.get("caseId");
  const dos = url.searchParams.get("dos");
  const all = url.searchParams.get("all");

  if (!caseId) {
    return NextResponse.json({ error: "caseId required" }, { status: 400 });
  }

  try {
    let claims: Awaited<ReturnType<typeof fetchClaimsForCaseDos>> = [];

    if (all === "1") {
      const batches = await fetchAllClaimsForCase(supabase, caseId);
      claims = batches.flatMap((b) => b.claims);
    } else if (dos) {
      claims = await fetchClaimsForCaseDos(supabase, caseId, dos);
    } else {
      return NextResponse.json(
        { error: "dos or all=1 required" },
        { status: 400 },
      );
    }

    if (claims.length === 0) {
      return NextResponse.json(
        { error: "No charges for this case/date" },
        { status: 404 },
      );
    }

    const bytes = await generateFilledCms1500Pdf(claims);
    const filename =
      all === "1"
        ? `cms1500-case-${caseId.slice(0, 8)}-all.pdf`
        : `cms1500-${dos}.pdf`;

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
