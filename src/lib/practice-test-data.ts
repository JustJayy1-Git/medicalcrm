/** Identifies iPad / practice rows safe to purge when resetting case numbering. */

export function isPracticeTestPatient(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): boolean {
  const first = (firstName ?? "").trim().toLowerCase();
  const last = (lastName ?? "").trim().toLowerCase();
  if (first === "intake" && last.startsWith("pending")) return true;
  if (first === "john" && (last === "doe" || last.startsWith("doe"))) return true;
  return false;
}

export function isPracticeTestCaseDescription(description: string | null | undefined): boolean {
  const d = (description ?? "").trim().toLowerCase();
  return (
    d === "portal intake in progress" ||
    d.startsWith("portal intake") ||
    d === "ipad intake test"
  );
}
