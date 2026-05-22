import { PortalDeviceLoginForm } from "./portal-device-login-form";

const DEVICE_SETUP_MESSAGE =
  "This iPad is not configured yet. Staff: sign in with the kiosk account below, or add KIOSK_DEVICE_EMAIL and KIOSK_DEVICE_PASSWORD in Vercel and redeploy.";

export default async function PortalDeviceLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const afterLogin =
    next && next.startsWith("/portal") && !next.startsWith("//") ? next : "/portal";

  const errorMessage =
    error === "device"
      ? DEVICE_SETUP_MESSAGE
      : error
        ? decodeURIComponent(error)
        : null;

  return (
    <PortalDeviceLoginForm afterLogin={afterLogin} errorMessage={errorMessage} />
  );
}
