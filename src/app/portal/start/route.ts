import { createPortalPacket, formatDbError } from "@/lib/intake-packet/form-persistence";
import { PORTAL_FORM_ORDER } from "@/lib/intake-packet/form-slugs";
import { kioskSignInErrorMessage } from "@/lib/portal/device-auth";
import { createPortalClient } from "@/lib/portal/portal-supabase";
import { NextResponse, type NextRequest } from "next/server";

function portalUrl(request: NextRequest, path: string) {
  return new URL(path, request.nextUrl.origin);
}

/** Plain HTTP redirect — reliable on iPad Safari (no server-action NEXT_REDIRECT). */
export async function POST(request: NextRequest) {
  const { supabase, user, kioskFailure } = await createPortalClient();

  if (!user) {
    if (kioskFailure) {
      const url = portalUrl(request, "/portal");
      url.searchParams.set("error", kioskSignInErrorMessage(kioskFailure));
      return NextResponse.redirect(url, 303);
    }
    const url = portalUrl(request, "/portal/login");
    url.searchParams.set("next", "/portal");
    url.searchParams.set("error", "device");
    return NextResponse.redirect(url, 303);
  }

  try {
    const { packetId } = await createPortalPacket(supabase, user.id);
    const first = PORTAL_FORM_ORDER[0];
    return NextResponse.redirect(
      portalUrl(request, `/portal/packet/${packetId}/forms/${first}`),
      303,
    );
  } catch (err) {
    const message = formatDbError(err);
    const url = portalUrl(request, "/portal");
    url.searchParams.set("error", message);
    return NextResponse.redirect(url, 303);
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(portalUrl(request, "/portal"), 307);
}
