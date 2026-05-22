import { PortalIntakeForm } from "@/components/intake/portal-intake-form";

export default async function PortalIntakePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMsg =
    error === "missing_name"
      ? "missing_name"
      : error
        ? decodeURIComponent(error)
        : null;

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-3xl w-full mx-auto">
      <div className="px-4 pt-4 shrink-0">
        <h1 className="text-2xl font-serif font-semibold text-eggplant-900">
          New patient intake
        </h1>
        <p className="text-sm text-vice-muted mt-1">
          Use the section tabs below — all fields save when you submit.
        </p>
      </div>
      <PortalIntakeForm errorMsg={errorMsg} />
    </div>
  );
}
