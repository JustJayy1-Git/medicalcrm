"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function StaffExitButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="text-[10px] uppercase tracking-widest text-white/40 hover:text-neon-mint px-2 py-1"
        aria-label="Staff exit"
      >
        Staff
      </button>

      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-sm rounded-xl bg-eggplant-900 border border-neon-pink/30 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-1">Exit kiosk mode</h2>
            <p className="text-sm text-white/60 mb-4">
              Enter the staff PIN to sign out and leave the intake portal.
            </p>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white mb-3"
            />
            {error ? <p className="text-sm text-red-400 mb-2">{error}</p> : null}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPin("");
                  setError("");
                }}
                className="px-4 py-2 text-sm text-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !pin}
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  const res = await fetch("/portal/api/staff-exit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pin }),
                  });
                  setLoading(false);
                  if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    setError((j as { error?: string }).error ?? "Incorrect PIN");
                    return;
                  }
                  router.replace("/login");
                  router.refresh();
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-neon-mint to-neon-pink text-eggplant-950 disabled:opacity-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
