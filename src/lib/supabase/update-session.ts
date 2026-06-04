import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isClinicalRole, isKioskRole } from "@/lib/auth-profile";
import { signInKioskDevice } from "@/lib/portal/device-auth";
import { isStaffCrmPath } from "@/lib/staff-crm-paths";

const PUBLIC_PREFIXES = ["/login", "/auth", "/portal/login"];
const PUBLIC_EXACT = new Set(["/", "/portal"]);

function isPortalWelcomePath(pathname: string) {
  return pathname === "/portal";
}

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPortalPath(pathname: string) {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

function isPortalLoginPath(pathname: string) {
  return pathname === "/portal/login" || pathname.startsWith("/portal/login/");
}

function isPortalApiPath(pathname: string) {
  return pathname.startsWith("/portal/api/");
}

function isKioskAllowedPath(pathname: string) {
  return (
    isPortalPath(pathname) ||
    pathname.startsWith("/api/intake-packets") ||
    pathname.startsWith("/serve/forms/") ||
    pathname.startsWith("/portal/api/")
  );
}

function isClinicalPath(pathname: string) {
  return pathname === "/clinical" || pathname.startsWith("/clinical/");
}

function isClinicalAllowedPath(pathname: string) {
  return (
    isClinicalPath(pathname) ||
    pathname.startsWith("/api/clinical/") ||
    pathname.startsWith("/auth/")
  );
}

/** Staff CRM entry — kiosk iPad sessions must never hijack these URLs. */
function isStaffEntryPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/forgot-password/")
  );
}

function copyResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options);
  });
}

/** Sign out kiosk and reload staff URL so Set-Cookie clears the iPad session. */
function redirectAfterKioskSignOut(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const dest = request.nextUrl.clone();
  dest.pathname = pathname;
  dest.search = "";
  const redirectResponse = NextResponse.redirect(dest, 303);
  copyResponseCookies(response, redirectResponse);
  return redirectResponse;
}

/** Refresh Supabase session cookies and enforce auth without losing the current URL. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("updateSession: missing Supabase env vars");
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    let {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname, search } = request.nextUrl;
    const isPublic = isPublicPath(pathname);

    if (!user && isPortalPath(pathname) && !isPortalLoginPath(pathname)) {
      const kioskUser = await signInKioskDevice(supabase);
      if (kioskUser) {
        user = kioskUser;
      } else if (!isPortalWelcomePath(pathname) && !isPortalApiPath(pathname)) {
        const portalLogin = request.nextUrl.clone();
        portalLogin.pathname = "/portal/login";
        portalLogin.searchParams.set("next", pathname + search);
        if (process.env.KIOSK_DEVICE_EMAIL) {
          portalLogin.searchParams.set("error", "device");
        }
        return NextResponse.redirect(portalLogin);
      }
    }

    if (!user && !isPublic) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set("next", pathname + search);
      return NextResponse.redirect(login);
    }

    let role: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      role = profile?.role ?? null;
    }

    // iPad /portal must never run as staff — swap to kiosk device session.
    if (user && isPortalPath(pathname) && !isKioskRole(role)) {
      await supabase.auth.signOut();
      user = null;
      role = null;
      const kioskUser = await signInKioskDevice(supabase);
      if (kioskUser) {
        user = kioskUser;
        role = "kiosk";
      } else if (
        !isPortalWelcomePath(pathname) &&
        !isPortalLoginPath(pathname) &&
        !isPortalApiPath(pathname)
      ) {
        const portalLogin = request.nextUrl.clone();
        portalLogin.pathname = "/portal/login";
        portalLogin.searchParams.set("next", pathname + search);
        return NextResponse.redirect(portalLogin);
      }
    }

    if (user && isClinicalRole(role)) {
      if (
        isStaffCrmPath(pathname) ||
        isPortalPath(pathname) ||
        pathname === "/dashboard"
      ) {
        const clinical = request.nextUrl.clone();
        clinical.pathname = "/clinical";
        clinical.search = "";
        return NextResponse.redirect(clinical);
      }
      if (!isClinicalAllowedPath(pathname) && !isPublicPath(pathname)) {
        const clinical = request.nextUrl.clone();
        clinical.pathname = "/clinical";
        clinical.search = "";
        return NextResponse.redirect(clinical);
      }
    }

    if (user && isKioskRole(role)) {
      if (isStaffEntryPath(pathname)) {
        // iPad kiosk cookie on lukarienz.com or /login → clear and reload staff page.
        await supabase.auth.signOut();
        return redirectAfterKioskSignOut(request, response, pathname);
      }
      if (!isKioskAllowedPath(pathname) && !pathname.startsWith("/auth/")) {
        // Staff CRM URLs (e.g. /patients/new) → staff login, not iPad portal.
        if (isStaffCrmPath(pathname)) {
          await supabase.auth.signOut();
          const login = request.nextUrl.clone();
          login.pathname = "/login";
          login.searchParams.set("next", pathname + search);
          const redirectResponse = NextResponse.redirect(login);
          copyResponseCookies(response, redirectResponse);
          return redirectResponse;
        }
        const portal = request.nextUrl.clone();
        portal.pathname = "/portal";
        portal.search = "";
        return NextResponse.redirect(portal);
      }
    }

    if (user && pathname === "/login") {
      if (isKioskRole(role)) {
        await supabase.auth.signOut();
        return redirectAfterKioskSignOut(request, response, "/login");
      }

      const next = request.nextUrl.searchParams.get("next");
      const dest = request.nextUrl.clone();
      if (isClinicalRole(role)) {
        dest.pathname =
          next && next.startsWith("/clinical") && !next.startsWith("//")
            ? next.split("?")[0]
            : "/clinical";
        dest.search = next?.includes("?") ? next.slice(next.indexOf("?")) : "";
      } else if (next && next.startsWith("/portal") && !next.startsWith("//")) {
        dest.pathname = "/dashboard";
        dest.search = "";
      } else if (next && next.startsWith("/") && !next.startsWith("//")) {
        dest.pathname = next.split("?")[0];
        dest.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
      } else {
        dest.pathname = "/dashboard";
        dest.search = "";
      }
      return NextResponse.redirect(dest);
    }

    if (user && isPortalLoginPath(pathname)) {
      const next = request.nextUrl.searchParams.get("next");
      const dest = request.nextUrl.clone();
      if (next && next.startsWith("/portal") && !next.startsWith("//")) {
        dest.pathname = next.split("?")[0];
        dest.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
      } else {
        dest.pathname = "/portal";
        dest.search = "";
      }
      return NextResponse.redirect(dest);
    }

    response.headers.set("x-pathname", pathname);
    return response;
  } catch (err) {
    console.error("updateSession:", err);
    return response;
  }
}
