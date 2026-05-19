"use client";

import { useEffect, useRef, useState } from "react";

type CodeResult = { code: string; description: string };

/**
 * Searchable code picker with magnifier icon.
 * - Type to search by code prefix or description keyword
 * - Click a result to select it
 * - The hidden input under `name` carries the selected CODE (string)
 *
 * Pass `endpoint` to switch between code libraries (e.g. /api/codes/icd,
 * /api/codes/cpt later).
 */
export function CodePicker({
  name,
  label,
  defaultValue = "",
  endpoint,
  placeholder = "Type code or keyword…",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  endpoint: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(defaultValue);
  const [results, setResults] = useState<CodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>(defaultValue);
  const [selectedDesc, setSelectedDesc] = useState<string>("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Look up the description for the prefilled value
  useEffect(() => {
    if (!defaultValue) return;
    fetch(`${endpoint}?q=${encodeURIComponent(defaultValue)}&limit=5`)
      .then((r) => r.json())
      .then((d) => {
        const match = (d.results as CodeResult[] | undefined)?.find(
          (r) => r.code === defaultValue,
        );
        if (match) setSelectedDesc(match.description);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search with debounce
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!open) return;
    debounceRef.current = window.setTimeout(() => {
      setLoading(true);
      fetch(`${endpoint}?q=${encodeURIComponent(q)}&limit=40`)
        .then((r) => r.json())
        .then((d) => setResults(d.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, open, endpoint]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(r: CodeResult) {
    setSelected(r.code);
    setSelectedDesc(r.description);
    setQ(r.code);
    setOpen(false);
  }

  function clear() {
    setSelected("");
    setSelectedDesc("");
    setQ("");
  }

  return (
    <div className="relative" ref={wrapRef}>
      <label className="block text-[11px] font-medium text-stone-600 mb-1">
        {label}
      </label>

      <div className="relative flex">
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setSelected(""); // typing invalidates current selection until pick
            setSelectedDesc("");
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 pr-8 text-sm bg-stone-50 border border-stone-300 rounded text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-amber-700"
          aria-label="Search codes"
          title="Search codes"
        >
          🔍
        </button>
        {selected && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-7 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 text-xs"
            aria-label="Clear"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* Hidden field carries the actual code value to the form */}
      <input type="hidden" name={name} value={selected} />

      {selectedDesc && (
        <p className="text-[10px] text-stone-500 mt-0.5 truncate">
          {selectedDesc}
        </p>
      )}

      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-stone-300 rounded-lg shadow-lg max-h-72 overflow-auto">
          {loading && (
            <div className="px-3 py-2 text-xs text-stone-500">Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-xs text-stone-500">
              {q ? "No matches." : "Type to search."}
            </div>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => pick(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 hover:text-amber-900 border-b border-stone-100 last:border-b-0"
              >
                <span className="font-mono text-xs text-amber-700">{r.code}</span>
                <span className="text-stone-600 ml-2">{r.description}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
