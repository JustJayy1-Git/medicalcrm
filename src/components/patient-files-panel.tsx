"use client";

import { useState, useTransition } from "react";
import {
  uploadAttachment,
  deleteAttachment,
  getAttachmentUrl,
} from "@/app/cases/[id]/edit/attachments-actions";
import { ATTACHMENT_KIND_LABEL, type AttachmentKind } from "@/lib/case-attachments";

export type PatientFile = {
  id: string;
  kind: string;
  label: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  case_id: string;
};

function fmtBytes(n: number | null): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function fileToBase64(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(f);
  });
}

export function PatientFilesPanel({
  patientId,
  defaultCaseId,
  initial,
}: {
  patientId: string;
  defaultCaseId: string | null;
  initial: PatientFile[];
}) {
  const [items, setItems] = useState<PatientFile[]>(initial);
  const [busy, startBusy] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(kind: AttachmentKind, file: File) {
    if (!defaultCaseId) {
      setError("Open a case for this patient before uploading files.");
      return;
    }
    setError(null);
    const base64 = await fileToBase64(file);
    startBusy(async () => {
      const res = await uploadAttachment({
        caseId: defaultCaseId,
        patientId,
        kind,
        fileName: file.name,
        mimeType: file.type,
        base64,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setItems((prev) => [
        {
          id: res.id,
          kind,
          label: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          created_at: new Date().toISOString(),
          case_id: defaultCaseId,
        },
        ...prev,
      ]);
    });
  }

  async function handleOpen(id: string) {
    const url = await getAttachmentUrl(id);
    if (url) window.open(url, "_blank");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    startBusy(async () => {
      const res = await deleteAttachment(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <section className="p-5 rounded-xl bg-white border border-vice-border shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neon-pink">
          Patient file folder
        </h2>
        {busy ? <span className="text-[10px] text-vice-muted">Working…</span> : null}
      </div>
      <p className="text-xs text-vice-muted mb-4">
        Intake forms, ID, insurance cards, and other documents for this patient.
      </p>

      {error ? (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {!defaultCaseId ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          No open case yet — finish iPad intake or create a case to upload documents.
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <UploadButton label="🪪 Driver's license / ID" onPick={(f) => handleUpload("id_card", f)} />
        <UploadButton
          label="📷 Insurance card — FRONT"
          onPick={(f) => handleUpload("insurance_card_front", f)}
        />
        <UploadButton
          label="📷 Insurance card — BACK"
          onPick={(f) => handleUpload("insurance_card_back", f)}
        />
        <UploadButton label="📎 Other document" onPick={(f) => handleUpload("other", f)} />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-vice-muted">
          No files yet. Completed iPad intakes appear here automatically as a compiled intake packet.
        </p>
      ) : (
        <ul className="divide-y divide-vice-border border border-vice-border rounded-lg overflow-hidden">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-3 py-2.5 text-sm bg-white">
              <span className="text-lg shrink-0" aria-hidden>
                {a.kind === "intake_packet" ? "📋" : a.kind === "id_card" ? "🪪" : "📄"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-neon-pink">
                  {ATTACHMENT_KIND_LABEL[a.kind as AttachmentKind] ?? a.kind}
                </p>
                <p className="truncate text-eggplant-800">{a.label ?? "(file)"}</p>
              </div>
              <span className="text-[11px] text-vice-muted shrink-0">{fmtBytes(a.size_bytes)}</span>
              <button
                type="button"
                onClick={() => void handleOpen(a.id)}
                className="text-xs px-2 py-1 border border-vice-border text-eggplant-800 rounded hover:bg-neon-mint-100 shrink-0"
              >
                Open
              </button>
              {a.kind !== "intake_packet" ? (
                <button
                  type="button"
                  onClick={() => void handleDelete(a.id)}
                  className="text-xs px-2 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50 shrink-0"
                >
                  Delete
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UploadButton({ label, onPick }: { label: string; onPick: (f: File) => void }) {
  return (
    <label className="cursor-pointer block px-3 py-3 text-center text-xs text-eggplant-800 border border-dashed border-vice-border rounded-lg hover:bg-[#41B6E6]/5 hover:border-[#41B6E6]/40 transition-colors">
      {label}
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
