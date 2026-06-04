"use client";

import { useState } from "react";
import { resetPracticeCasesAndNumbering } from "@/app/cases/reset-practice-action";

export function ResetPracticeCasesButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleReset() {
    const ok = window.confirm(
      "Remove all John Doe and iPad test patients/cases and reset the next case number to 1?\n\nThis cannot be undone. Real patients with other names are kept.",
    );
    if (!ok) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await resetPracticeCasesAndNumbering();
      setMessage(
        `Removed ${result.deletedPatients} test patient(s). Next case number will be ${result.nextCaseNumber}.`,
      );
      window.location.href = "/cases?reset=1";
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleReset()}
        className="text-sm text-red-800 border border-red-200 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? "Resetting…" : "Reset practice cases to #1"}
      </button>
      {message ? <p className="text-xs text-red-700 max-w-xs text-right">{message}</p> : null}
    </div>
  );
}
