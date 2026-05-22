import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isKioskRole } from "@/lib/auth-profile";

const PUBLIC_PREFIXES = ["/login", "/auth"];
const PUBLIC_EXACT = new Set(["/"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPortalPath(pathname: string) {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

function isKioskAllowedPath(pathname: string) {
  return (
    isPortalPath(pathname) ||
    pathname.startsWith("/api/intake-packets") ||
    pathname.startsWith("/serve/forms/") ||
    pathname.startsWith("/portal/api/")
  );
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname, search } = request.nextUrl;
    const isPublic = isPublicPath(pathname);

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

    if (user && isKioskRole(role)) {
      if (
        !isKioskAllowedPath(pathname) &&
        pathname !== "/login" &&
        !pathname.startsWith("/auth/")
      ) {
        const portal = request.nextUrl.clone();
        portal.pathname = "/portal";
        portal.search = "";
        return NextResponse.redirect(portal);
      }
    }

    if (user && pathname === "/login") {
      const next = request.nextUrl.searchParams.get("next");
      const dest = request.nextUrl.clone();
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        dest.pathname = next.split("?")[0];
        dest.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
      } else if (isKioskRole(role)) {
        dest.pathname = "/portal";
        dest.search = "";
      } else {
        dest.pathname = "/dashboard";
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
