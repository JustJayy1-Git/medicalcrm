import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isPublic =
    pathname.startsWith("/staff/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/";

  if (!isPublic && !isLoggedIn) {
    const login = new URL("/staff/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }
  if (pathname === "/staff/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/staff/packets", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
