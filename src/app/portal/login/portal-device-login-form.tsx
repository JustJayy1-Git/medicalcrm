"use client";

import { LogoMark } from "@/components/logo-mark";
import { StaffLandingBackground } from "@/components/staff-landing-background";
import { useFormStatus } from "react-dom";
import { portalDeviceSignIn } from "./actions";

function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in this iPad"}
    </button>
  );
}

/** One-time iPad setup — staff signs in the kiosk account. Patients never use this page. */
export function PortalDeviceLoginForm({
  afterLogin,
  errorMessage,
}: {
  afterLogin: string;
  errorMessage?: string | null;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0c0f15] px-6 py-10">
      <StaffLandingBackground />
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <LogoMark
          variant="header"
          width={200}
          height={200}
          priority
          className="mb-6 w-[min(240px,65vw)] h-auto max-w-[280px]"
        />
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-white text-center mb-2">
          Patient intake — <span className="lux-gold-text">iPad setup</span>
        </h1>
        <div className="lux-hairline w-40 mx-auto mb-3" />
        <p className="text-[#c8d2e0]/60 text-center max-w-md mb-8 text-sm">
          Staff only: sign in once with the kiosk account. After setup, bookmark{" "}
          <span className="text-[#41B6E6]">/portal</span> on the home screen. Patients will not see
          this screen.
        </p>

        <form
          action={portalDeviceSignIn}
          className="w-full bg-[#121820]/80 border border-[#c9a35c]/30 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-[0_0_40px_rgba(201,163,92,0.06)]"
        >
          <input type="hidden" name="afterLogin" value={afterLogin} />
          <label className="block">
            <span className="block text-sm text-[#c8d2e0]/75 mb-1">Kiosk email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-lg bg-[#0c0f15] border border-[#41B6E6]/25 text-white"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-[#c8d2e0]/75 mb-1">Kiosk password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg bg-[#0c0f15] border border-[#41B6E6]/25 text-white"
            />
          </label>

          {errorMessage ? (
            <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          ) : null}

          <SignInButton />
        </form>

        <p className="mt-8 text-xs text-[#c8d2e0]/35 text-center max-w-sm">
          Staff CRM (LUKARIENZ) is at{" "}
          <a href="/login" className="text-[#41B6E6] underline">
            /login
          </a>{" "}
          on a computer — not on the patient iPad.
        </p>
      </div>
    </div>
  );
}
