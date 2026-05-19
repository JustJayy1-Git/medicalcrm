"use client";

import { useState, useTransition } from "react";
import {
  uploadAttachment,
  deleteAttachment,
  getAttachmentUrl,
} from "@/app/cases/[id]/edit/attachments-actions";

export type Attachment = {
  id: string;
  kind: string;
  label: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

const KIND_LABEL: Record<string, string> = {
  insurance_card_front: "Insurance card (front)",
  insurance_card_back: "Insurance card (back)",
  id_card: "Driver's license / ID",
  lop_letter: "LOP letter",
  police_report: "Police report",
  medical_record: "Medical record",
  other: "Other",
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

export function AttachmentsPanel({
  caseId,
  patientId,
  initial,
}: {
  caseId: string;
  patientId: string;
  initial: Attachment[];
}) {
  const [items, setItems] = useState<Attachment[]>(initial);
  const [busy, startBusy] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(kind: string, file: File) {
    setError(null);
    const base64 = await fileToBase64(file);
    startBusy(async () => {
      const res = await uploadAttachment({
        caseId,
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
    <section className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
          Insurance card & documents
        </h2>
        {busy && (
          <span className="text-[10px] text-stone-500">Working…</span>
        )}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <UploadButton
          label="📷 Insurance card — FRONT"
          onPick={(f) => handleUpload("insurance_card_front", f)}
        />
        <UploadButton
          label="📷 Insurance card — BACK"
          onPick={(f) => handleUpload("insurance_card_back", f)}
        />
        <UploadButton
          label="🪪 Driver's license / ID"
          onPick={(f) => handleUpload("id_card", f)}
        />
        <UploadButton
          label="📎 Other (LOP, police report, etc.)"
          onPick={(f) => handleUpload("other", f)}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-stone-500">
          No files yet. Upload the insurance card and we&apos;ll keep it
          attached to this case.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 border border-stone-200 rounded">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <span className="text-[10px] uppercase tracking-wider text-amber-700 w-44 shrink-0">
                {KIND_LABEL[a.kind] ?? a.kind}
              </span>
              <span className="flex-1 truncate text-stone-700">
                {a.label ?? "(file)"}
              </span>
              <span className="text-[11px] text-stone-400">
                {fmtBytes(a.size_bytes)}
              </span>
              <button
                type="button"
                onClick={() => handleOpen(a.id)}
                className="text-xs px-2 py-1 border border-stone-300 text-stone-700 rounded hover:bg-stone-100"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="text-xs px-2 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UploadButton({
  label,
  onPick,
}: {
  label: string;
  onPick: (f: File) => void;
}) {
  return (
    <label className="cursor-pointer block px-3 py-3 text-center text-xs text-stone-700 border border-dashed border-stone-300 rounded hover:bg-amber-50 hover:border-amber-400 transition-colors">
      {label}
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = ""; // allow re-uploading same file
        }}
      />
    </label>
  );
}
