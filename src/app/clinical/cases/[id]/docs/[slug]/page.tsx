import Link from "next/link";
import { notFound } from "next/navigation";
import { saveClinicalDocument } from "@/app/clinical/cases/[id]/actions";
import { DOC_COMPONENTS } from "@/components/clinical/docs";
import { PaperIdentStrip, PaperSheet } from "@/components/clinical/paper-doc";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import {
  CLINICAL_DOC_ORDER,
  DOC_META,
  SECTION_COMPLETED_KEY,
  SECTION_JSON_KEY,
  isClinicalDocSlug,
} from "@/lib/clinical/doc-slugs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US");
}

export default async function ClinicalDocPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id: caseId, slug } = await params;
  if (!isClinicalDocSlug(slug)) notFound();

  const supabase = await createClient();
  let consultation: Awaited<ReturnType<typeof getClinicalConsultation>> = null;
  try {
    consultation = await getClinicalConsultation(supabase, caseId);
  } catch {
    notFound();
  }
  if (!consultation) notFound();

  const patient = Array.isArray(consultation.patient)
    ? consultation.patient[0]
    : consultation.patient;
  const caseRow = Array.isArray(consultation.case)
    ? consultation.case[0]
    : consultation.case;

  const patientName = patient
    ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
    : "Patient";

  const meta = DOC_META[slug];
  const pageIndex = CLINICAL_DOC_ORDER.indexOf(slug);
  const totalPages = CLINICAL_DOC_ORDER.length;
  const prevSlug = pageIndex > 0 ? CLINICAL_DOC_ORDER[pageIndex - 1] : null;
  const nextSlug =
    pageIndex < totalPages - 1 ? CLINICAL_DOC_ORDER[pageIndex + 1] : null;
  const basePath = `/clinical/cases/${caseId}/docs`;

  const record = consultation as unknown as Record<string, unknown>;
  const initial =
    (record[SECTION_JSON_KEY[meta.section]] as Record<string, unknown>) ?? {};
  const completedAt = record[SECTION_COMPLETED_KEY[meta.section]] as
    | string
    | null;

  const today = new Date().toLocaleDateString("en-CA");
  const Doc = DOC_COMPONENTS[slug];
  const formId = "clinical-doc-form";

  return (
    <div className="flex h-full min-h-[100dvh] flex-col bg-[#1a1d24]">
      {/* Intake-style toolbar */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 bg-[#0c0f15] px-4 py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#e6c987]/50 after:to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/clinical"
            className="lux-gold-text shrink-0 font-serif text-xs font-bold uppercase tracking-wider"
          >
            ← Queue
          </Link>
          <span className="truncate text-[10px] uppercase tracking-widest text-[#c8d2e0]/70">
            {patientName} · {meta.shortLabel} · Page{" "}
            {String(pageIndex + 1).padStart(2, "0")} of{" "}
            {String(totalPages).padStart(2, "0")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {prevSlug ? (
            <Link
              href={`${basePath}/${prevSlug}`}
              className="rounded-md border border-[#2a2f3a] px-3 py-1.5 text-xs font-bold uppercase text-[#c8d2e0] hover:border-[#41B6E6] hover:text-white"
            >
              ← Back
            </Link>
          ) : null}
          <button
            type="submit"
            form={formId}
            name="_nav"
            value={nextSlug ? `${basePath}/${nextSlug}` : "/clinical"}
            className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-3 py-1.5 text-xs font-bold uppercase text-white"
          >
            {nextSlug ? "Save & next →" : "Save & finish"}
          </button>
        </div>
      </header>

      {/* Document nav pills */}
      <nav className="flex shrink-0 flex-wrap items-center gap-2 bg-[#12151c] px-4 py-2">
        {CLINICAL_DOC_ORDER.map((s, i) => {
          const sMeta = DOC_META[s];
          const done = Boolean(record[SECTION_COMPLETED_KEY[sMeta.section]]);
          const active = s === slug;
          return (
            <Link
              key={s}
              href={`${basePath}/${s}`}
              className={[
                "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                active
                  ? "border-[#e6c987]/70 bg-[#c9a35c]/15 text-[#e6c987]"
                  : done
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-[#2a2f3a] text-[#c8d2e0]/60 hover:text-white",
              ].join(" ")}
            >
              {i + 1}. {sMeta.shortLabel}
              {done ? " ✓" : ""}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-auto px-3">
        <form id={formId} action={saveClinicalDocument}>
          <input type="hidden" name="case_id" value={caseId} />
          <input type="hidden" name="section" value={meta.section} />

          <PaperSheet
            title={meta.title}
            titleEs={meta.titleEs}
            page={pageIndex + 1}
            totalPages={totalPages}
          >
            <PaperIdentStrip
              fields={[
                { label: "Patient", value: patientName },
                { label: "Date of birth", value: fmtDate(patient?.date_of_birth) },
                { label: "Case #", value: String(caseRow?.case_number ?? "") },
                { label: "Date of injury", value: fmtDate(caseRow?.date_of_injury) },
              ]}
            />

            {completedAt ? (
              <p className="mx-6 mt-3 rounded-sm border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
                ✓ Completed {new Date(completedAt).toLocaleString("en-US")} — you can
                still make corrections and re-save.
              </p>
            ) : null}

            <Doc initial={initial} patientName={patientName} today={today} />

            {/* Paper footer actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-[#e0e0e0] px-6 py-4">
              <button
                type="submit"
                className="rounded-md border border-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-black hover:bg-black/5"
              >
                Save draft
              </button>
              <button
                type="submit"
                name="_complete"
                value="1"
                className="rounded-md bg-black px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-black/80"
              >
                Save &amp; mark complete
              </button>
              <span className="ml-auto text-[9px] uppercase tracking-widest text-black/40">
                Pro Injury Medical &amp; Rehabilitation
              </span>
            </div>
          </PaperSheet>
        </form>
        <div className="h-6" />
      </div>
    </div>
  );
}
