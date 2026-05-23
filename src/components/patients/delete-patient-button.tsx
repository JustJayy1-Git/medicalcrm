"use client";

import { useState } from "react";
import { deletePatient } from "@/app/patients/actions";

export function DeletePatientButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmDelete() {
    setLoading(true);
    await deletePatient(patientId);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs border border-red-300 text-red-700 rounded-md hover:bg-red-50"
      >
        Delete patient
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-vice-border">
            <h2 className="text-lg font-semibold text-eggplant-900 mb-2">Delete patient?</h2>
            <p className="text-sm text-eggplant-700 mb-4">
              This permanently removes <strong>{patientName}</strong> and all linked{" "}
              <strong>cases</strong>, visits, charges, and intake packets. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm rounded-md border border-vice-border hover:bg-vice-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
