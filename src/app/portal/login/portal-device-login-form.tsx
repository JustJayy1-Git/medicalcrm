"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import { portalDeviceSignIn } from "./actions";

function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-neon-mint to-neon-pink text-eggplant-950 disabled:opacity-60"
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-eggplant-950 via-eggplant-900 to-[#1a1d24] px-6 py-10">
      <Image src="/logo.png" alt="Pro Injury" width={88} height={88} priority className="mb-6" />
      <h1 className="text-2xl md:text-3xl font-serif font-semibold text-white text-center mb-2">
        Patient intake — iPad setup
      </h1>
      <p className="text-white/55 text-center max-w-md mb-8 text-sm">
        Staff only: sign in once with the kiosk account. After setup, bookmark{" "}
        <span className="text-neon-mint/90">/portal</span> on the home screen. Patients
        will not see this screen.
      </p>

      <form
        action={portalDeviceSignIn}
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
      >
        <input type="hidden" name="afterLogin" value={afterLogin} />
        <label className="block">
          <span className="block text-sm text-white/70 mb-1">Kiosk email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="w-full px-4 py-3 rounded-lg bg-eggplant-950 border border-white/15 text-white"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-white/70 mb-1">Kiosk password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-lg bg-eggplant-950 border border-white/15 text-white"
          />
        </label>

        {errorMessage ? (
          <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        ) : null}

        <SignInButton />
      </form>

      <p className="mt-8 text-xs text-white/30 text-center max-w-sm">
        Staff CRM login is at{" "}
        <a href="/login" className="text-white/45 underline">
          /login
        </a>{" "}
        on a computer — not on the patient iPad.
      </p>
    </div>
  );
}
