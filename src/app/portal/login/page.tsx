import { PortalDeviceLoginForm } from "./portal-device-login-form";

export default async function PortalDeviceLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const afterLogin =
    next && next.startsWith("/portal") && !next.startsWith("//") ? next : "/portal";

  return (
    <PortalDeviceLoginForm
      afterLogin={afterLogin}
      setupError={error === "device" ? "device" : null}
    />
  );
}
