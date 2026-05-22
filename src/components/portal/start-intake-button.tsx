"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartIntakeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/portal/api/start-intake", { method: "POST" });
      const contentType = res.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        if (res.url.includes("/portal/login") || res.status === 401 || res.status === 403) {
          router.push("/portal/login?next=/portal&error=device");
          return;
        }
        setError(
          "iPad kiosk is not configured on the server yet. Ask front desk to add KIOSK_DEVICE_EMAIL and KIOSK_DEVICE_PASSWORD in Vercel, then redeploy.",
        );
        return;
      }

      const body = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !body.url) {
        if (res.status === 503) {
          router.push("/portal/login?next=/portal&error=device");
          return;
        }
        setError(body.error ?? "Could not start intake. Ask front desk for help.");
        return;
      }

      router.push(body.url);
      router.refresh();
    } catch {
      setError(
        "Could not reach the intake server. If this keeps happening, ask front desk to verify Vercel kiosk settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={handleStart}
        className="px-14 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-neon-mint to-neon-pink text-eggplant-950 shadow-lg hover:brightness-110 transition disabled:opacity-60"
      >
        {loading ? "Loading forms…" : "New patient — start intake"}
      </button>
      {error ? (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-2 max-w-sm text-center">
          {error}
        </p>
      ) : null}
    </div>
  );
}
