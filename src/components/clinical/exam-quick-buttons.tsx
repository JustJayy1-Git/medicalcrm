"use client";

import { useRef } from "react";

const CHECK_SUFFIX = /_(absent|normal)$/;
const UNCHECK_SUFFIX = /_(present|decreased|pain)$/;
const LEVEL_SUFFIX = /_(c[1-7]|t1[0-2]|t[1-9]|l[1-5]|s1|r|l)$/;

/**
 * One-tap exam filling for the Initial Evaluation: marks every Absent and
 * Normal checkbox and clears the contradicting Present / Pain / Decreased
 * boxes (plus vertebral levels, R/L, and muscle-spasm lists). The NP then
 * flips only the abnormal findings.
 */
export function ExamQuickButtons() {
  const ref = useRef<HTMLDivElement>(null);

  function eachExamBox(fn: (cb: HTMLInputElement, name: string) => void) {
    const form = ref.current?.closest("form");
    if (!form) return;
    form
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((cb) => fn(cb, cb.name));
  }

  function markAllNormal() {
    eachExamBox((cb, name) => {
      if (CHECK_SUFFIX.test(name)) cb.checked = true;
      else if (
        UNCHECK_SUFFIX.test(name) ||
        LEVEL_SUFFIX.test(name) ||
        name.includes("_spasm_")
      ) {
        cb.checked = false;
      }
    });
  }

  function clearExam() {
    eachExamBox((cb, name) => {
      if (
        CHECK_SUFFIX.test(name) ||
        UNCHECK_SUFFIX.test(name) ||
        LEVEL_SUFFIX.test(name) ||
        name.includes("_spasm_")
      ) {
        cb.checked = false;
      }
    });
  }

  return (
    <div
      ref={ref}
      className="no-print mx-auto mb-2 flex w-[816px] max-w-full flex-wrap items-center justify-end gap-2 print:hidden"
    >
      <span className="mr-auto text-[10px] uppercase tracking-widest text-[#c8d2e0]/60">
        Quick exam fill
      </span>
      <button
        type="button"
        onClick={markAllNormal}
        className="rounded-md border border-emerald-500/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/10"
      >
        ✓ Mark all Absent / Normal
      </button>
      <button
        type="button"
        onClick={clearExam}
        className="rounded-md border border-[#2a2f3a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c8d2e0]/70 hover:text-white"
      >
        Clear exam checks
      </button>
    </div>
  );
}
