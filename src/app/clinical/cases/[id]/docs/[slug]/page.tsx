import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { saveClinicalDocument } from "@/app/clinical/cases/[id]/actions";
import { DOC_COMPONENTS } from "@/components/clinical/docs";
import { getClinicalConsultation } from "@/lib/clinical/consultation";
import {
  DOC_META,
  SECTION_COMPLETED_KEY,
  SECTION_JSON_KEY,
  isClinicalDocSlug,
  packetForVisitKind,
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

  const record = consultation as unknown as Record<string, unknown>;
  const visitKind = (record.visit_kind as string) ?? "initial";
  const packet = packetForVisitKind(visitKind);

  // Keep the NP inside the right packet for this visit type.
  if (!(packet as readonly string[]).includes(slug)) {
    redirect(`/clinical/cases/${caseId}/docs/${packet[0]}`);
  }

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
  const pageIndex = (packet as readonly string[]).indexOf(slug);
  const totalDocs = packet.length;
  const prevSlug = pageIndex > 0 ? packet[pageIndex - 1] : null;
  const nextSlug = pageIndex < totalDocs - 1 ? packet[pageIndex + 1] : null;
  const basePath = `/clinical/cases/${caseId}/docs`;

  const initial =
    (record[SECTION_JSON_KEY[meta.section]] as Record<string, unknown>) ?? {};
  const completedAt = record[SECTION_COMPLETED_KEY[meta.section]] as
    | string
    | null;

  const today = new Date().toLocaleDateString("en-CA");
  const Doc = DOC_COMPONENTS[slug];
  const formId = "clinical-doc-form";

  const ident = [
    { label: "Patient", value: patientName },
    { label: "Date of birth", value: fmtDate(patient?.date_of_birth) },
    { label: "Case #", value: String(caseRow?.case_number ?? "") },
    { label: "Date of injury", value: fmtDate(caseRow?.date_of_injury) },
  ];

  return (
    <div className="flex h-full min-h-[100dvh] flex-col bg-[#1a1d24]">
      {/* Intake-style toolbar */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 bg-[#0c0f15] px-4 py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#e6c987]/50 after:to-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/clinical"
            className="lux-gold-text shrink-0 font-serif text-xs font-bold uppercase tracking-wider"
          >
            ← Queue
          </Link>
          <span className="truncate text-[10px] uppercase tracking-widest text-[#c8d2e0]/70">
            {patientName} · {visitKind === "follow_up" ? "Follow-up" : "Initial consultation"} ·
            Document {pageIndex + 1} of {totalDocs}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={`/clinical/cases/${caseId}/print`}
            className="rounded-md border border-[#c9a35c]/50 px-3 py-1.5 text-xs font-bold uppercase text-[#e6c987] hover:bg-[#c9a35c]/10"
          >
            🖨 Print
          </Link>
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
            name={nextSlug ? "_nav" : "_finish"}
            value={nextSlug ? `${basePath}/${nextSlug}` : "/clinical"}
            className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-3 py-1.5 text-xs font-bold uppercase text-white"
          >
            {nextSlug ? "Save & next →" : "Save, complete & finish"}
          </button>
        </div>
      </header>

      {/* Document pills */}
      <nav className="flex shrink-0 flex-wrap items-center gap-2 bg-[#12151c] px-4 py-2">
        {packet.map((s, idx) => {
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
              {idx + 1}. {sMeta.shortLabel}
              {done ? " ✓" : ""}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-auto px-3">
        <form id={formId} action={saveClinicalDocument}>
          <input type="hidden" name="case_id" value={caseId} />
          <input type="hidden" name="section" value={meta.section} />

          {completedAt ? (
            <p className="mx-auto mt-4 w-[816px] max-w-full rounded-sm border border-emerald-500/50 bg-emerald-950/40 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
              ✓ Completed {new Date(completedAt).toLocaleString("en-US")} — you can
              still make corrections and re-save.
            </p>
          ) : null}

          <Doc
            initial={initial}
            patientName={patientName}
            today={today}
            dateOfInjury={(caseRow?.date_of_injury as string | null) ?? undefined}
            page={pageIndex + 1}
            totalPages={totalDocs}
            ident={ident}
          />

          {/* Save actions */}
          <div className="mx-auto mb-8 flex w-[816px] max-w-full flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-md border border-[#2a2f3a] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#c8d2e0] hover:border-[#41B6E6] hover:text-white"
            >
              Save draft
            </button>
            <button
              type="submit"
              name="_complete"
              value="1"
              className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
            >
              Save &amp; mark complete
            </button>
            <span className="lux-gold-text ml-auto font-serif text-[10px] font-semibold uppercase tracking-widest">
              Pro Injury Medical &amp; Rehabilitation
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
