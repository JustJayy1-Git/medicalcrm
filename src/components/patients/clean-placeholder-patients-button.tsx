"use client";

import { useState } from "react";
import { deletePortalPlaceholderPatients } from "@/app/patients/actions";

export function CleanPlaceholderPatientsButton({ count }: { count: number }) {
  const [loading, setLoading] = useState(false);

  if (count <= 0) return null;

  async function handleClean() {
    const ok = window.confirm(
      `Remove ${count} unfinished iPad placeholder patient(s)?\n\nThese are empty "Intake Pending" rows from iPad tests that were never completed. Real patients are not affected.`,
    );
    if (!ok) return;
    setLoading(true);
    await deletePortalPlaceholderPatients();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClean}
      className="text-sm text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 disabled:opacity-60"
    >
      {loading ? "Removing…" : `Remove ${count} iPad placeholder${count === 1 ? "" : "s"}`}
    </button>
  );
}
