/** Routes that render without the CRM sidebar (login, print, landing). */
export function isBareLayoutPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (/\/cases\/[^/]+\/billing-report$/.test(pathname)) return true;
  if (pathname.startsWith("/reports/cms-1500/print")) return true;
  if (pathname.startsWith("/reports/attorney-ledger/print")) return true;
  if (pathname.startsWith("/reports/ar-aging/print")) return true;
  if (pathname.startsWith("/portal")) return true;
  if (pathname.startsWith("/clinical")) return true;
  if (pathname.startsWith("/therapy")) return true;
  if (pathname.startsWith("/intake-packets/") && pathname.includes("/forms/")) return true;
  return false;
}

export function isCrmShellPath(pathname: string) {
  return !isBareLayoutPath(pathname);
}
