/** iPad portal creates a temporary row before the patient enters their name. */
export function isPortalPlaceholderPatient(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): boolean {
  return (
    (firstName ?? "").trim().toLowerCase() === "intake" &&
    (lastName ?? "").trim().toLowerCase().startsWith("pending")
  );
}

export function portalPlaceholderPatientFilter() {
  // NOT (first_name = 'Intake' AND last_name LIKE 'Pending%')
  return "first_name.neq.Intake,last_name.not.like.Pending%";
}
