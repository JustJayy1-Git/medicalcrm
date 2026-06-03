/** Staff-only CRM routes (not iPad /portal). Kiosk sessions must not stay on these URLs. */
const STAFF_CRM_PREFIXES = [
  "/dashboard",
  "/patients",
  "/cases",
  "/providers",
  "/facilities",
  "/insurance",
  "/attorneys",
  "/templates",
  "/billing",
  "/claims",
  "/reports",
  "/lists",
  "/schedule",
  "/intake-packets",
] as const;

export function isStaffCrmPath(pathname: string): boolean {
  return STAFF_CRM_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
