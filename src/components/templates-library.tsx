"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CATEGORY_LABEL,
  TEMPLATE_CATEGORIES,
  type DocumentTemplate,
} from "@/lib/document-template";
import {
  deleteTemplate,
  getTemplateUrl,
  uploadTemplate,
} from "@/app/templates/actions";

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

export function TemplatesLibrary({
  initial,
}: {
  initial: DocumentTemplate[];
}) {
  const [items, setItems] = useState(initial);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("patient_file");
  const [busy, startBusy] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = items.filter((t) => t.is_active);
    if (categoryFilter) list = list.filter((t) => t.category === categoryFilter);
    return list.sort(
      (a, b) =>
        a.sort_rank - b.sort_rank || a.name.localeCompare(b.name),
    );
  }, [items, categoryFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, DocumentTemplate[]>();
    for (const t of filtered) {
      const key = t.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [filtered]);

  async function openTemplate(id: string, forPrint: boolean) {
    const url = await getTemplateUrl(id);
    if (!url) {
      setError("Could not open file.");
      return;
    }
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (forPrint && w) {
      w.addEventListener("load", () => {
        try {
          w.print();
        } catch {
          /* PDF viewer may block; user can print from browser */
        }
      });
    }
  }

  async function handleUpload(file: File) {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    const displayName = name.trim() || file.name.replace(/\.pdf$/i, "");
    const base64 = await fileToBase64(file);
    startBusy(async () => {
      const res = await uploadTemplate({
        name: displayName,
        description: description.trim() || null,
        category,
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
          name: displayName,
          description: description.trim() || null,
          category,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          sort_rank: 100,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setName("");
      setDescription("");
      setShowUpload(false);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this template from the library?")) return;
    startBusy(async () => {
      const res = await deleteTemplate(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setItems((prev) => prev.filter((t) => t.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-vice-border rounded-lg text-sm text-eggplant-900 focus:outline-none focus:ring-2 focus:ring-neon-mint/40"
        >
          <option value="">All categories</option>
          {TEMPLATE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowUpload((v) => !v)}
          className="px-4 py-2 text-sm bg-gradient-to-b from-neon-pink to-neon-mint text-eggplant-900 font-semibold rounded-md hover:brightness-110 shadow-sm"
        >
          {showUpload ? "Cancel upload" : "+ Upload PDF template"}
        </button>
        {busy && (
          <span className="text-xs text-vice-muted">Working…</span>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {showUpload && (
        <section className="p-5 rounded-xl bg-white border border-vice-border shadow-sm">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
            Upload template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
                Display name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New patient welcome letter"
                className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded"
              >
                {TEMPLATE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-eggplant-700 mb-1">
                Description (optional)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="When staff should use this form"
                className="w-full px-2 py-1.5 text-sm bg-vice-surface border border-vice-border rounded"
              />
            </div>
          </div>
          <label className="cursor-pointer block px-4 py-8 text-center text-sm text-eggplant-800 border-2 border-dashed border-vice-border rounded-lg hover:bg-neon-mint-100 hover:border-neon-mint transition-colors">
            Drop a PDF here or click to browse
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
          </label>
          <p className="text-[10px] text-vice-muted mt-2">
            PDF only, max 25 MB. Files are stored securely for your office only.
          </p>
        </section>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-vice-muted rounded-xl border border-vice-border bg-white">
          {items.length === 0 ? (
            <>
              No templates yet. Upload PDFs your team prints for patient files,
              letters, and billing.
            </>
          ) : (
            "No templates in this category."
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {TEMPLATE_CATEGORIES.filter(
            (c) => grouped.has(c.value) && (!categoryFilter || categoryFilter === c.value),
          ).map((cat) => {
            const list = grouped.get(cat.value) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={cat.value}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-pink mb-3">
                  {cat.label}
                </h2>
                <div className="rounded-xl border border-vice-border overflow-hidden bg-white shadow-sm divide-y divide-vice-border">
                  {list.map((t) => (
                    <TemplateRow
                      key={t.id}
                      template={t}
                      onOpen={() => openTemplate(t.id, false)}
                      onPrint={() => openTemplate(t.id, true)}
                      onDelete={() => handleDelete(t.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TemplateRow({
  template: t,
  onOpen,
  onPrint,
  onDelete,
}: {
  template: DocumentTemplate;
  onOpen: () => void;
  onPrint: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-vice-surface">
      <span className="text-lg shrink-0" title="PDF">
        📄
      </span>
      <div className="flex-1 min-w-[200px]">
        <p className="font-medium text-eggplant-900">{t.name}</p>
        {t.description && (
          <p className="text-xs text-vice-muted mt-0.5">{t.description}</p>
        )}
        <p className="text-[10px] text-vice-muted mt-1">
          {t.file_name} · {fmtBytes(t.size_bytes)} ·{" "}
          {CATEGORY_LABEL[t.category] ?? t.category}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="px-3 py-1.5 text-xs border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="px-3 py-1.5 text-xs bg-eggplant-900 text-white rounded-md hover:bg-eggplant-900"
        >
          Print
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded-md hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
