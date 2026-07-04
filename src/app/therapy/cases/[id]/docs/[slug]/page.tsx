import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConsentForTherapyForm } from "@/components/therapy/consent-doc";
import { TherapySoapNoteForm } from "@/components/therapy/soap-note-doc";
import { sendCaseToNpFollowUp } from "@/app/cases/[id]/followup-action";
import {
  getTherapyCase,
  listTherapySessions,
  SOAP_PROCEDURE_LABELS,
  sessionProcedureLines,
} from "@/lib/therapy/therapy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const THERAPY_DOCS = ["consent", "soap-note"] as const;
type TherapyDocSlug = (typeof THERAPY_DOCS)[number];

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US");
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TherapyDocPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id: caseId, slug } = await params;
  if (!(THERAPY_DOCS as readonly string[]).includes(slug)) notFound();

  const supabase = await createClient();
  let caseRow: Awaited<ReturnType<typeof getTherapyCase>> = null;
  try {
    caseRow = await getTherapyCase(supabase, caseId);
  } catch {
    notFound();
  }
  if (!caseRow) notFound();

  const patient = one(caseRow.patient);
  const consent = one(caseRow.consent);
  if (!patient) notFound();

  const consentSigned = Boolean(consent?.signed_at);
  const basePath = `/therapy/cases/${caseId}/docs`;

  // Step gate: the consent must be signed before the therapy sheet opens.
  if (slug === "soap-note" && !consentSigned) {
    redirect(`${basePath}/consent`);
  }

  const patientName = `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim();
  const today = new Date().toLocaleDateString("en-CA");
  const docIndex = slug === "consent" ? 0 : 1;
  const formId = "therapy-doc-form";

  const ident = [
    { label: "Patient", value: patientName },
    { label: "Date of birth", value: fmtDate(patient.date_of_birth) },
    { label: "Case #", value: String(caseRow.case_number ?? "") },
    { label: "Date of injury", value: fmtDate(caseRow.date_of_injury) },
  ];

  const sessions =
    slug === "soap-note" ? await listTherapySessions(supabase, caseId) : [];

  return (
    <div className="flex h-full min-h-[100dvh] flex-col bg-[#1a1d24]">
      {/* Intake-style toolbar */}
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 bg-[#0c0f15] px-4 py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#e6c987]/50 after:to-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/therapy"
            className="lux-gold-text shrink-0 font-serif text-xs font-bold uppercase tracking-wider"
          >
            ← Queue
          </Link>
          <span className="truncate text-[10px] uppercase tracking-widest text-[#c8d2e0]/70">
            {patientName} · {slug === "consent" ? "Consent for therapy" : "Therapy SOAP note"} ·
            Document {docIndex + 1} of 2
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={`/therapy/cases/${caseId}/print`}
            className="rounded-md border border-[#c9a35c]/50 px-3 py-1.5 text-xs font-bold uppercase text-[#e6c987] hover:bg-[#c9a35c]/10"
          >
            🖨 Print
          </Link>
          {slug === "soap-note" ? (
            <Link
              href={`${basePath}/consent`}
              className="rounded-md border border-[#2a2f3a] px-3 py-1.5 text-xs font-bold uppercase text-[#c8d2e0] hover:border-[#41B6E6] hover:text-white"
            >
              ← Back
            </Link>
          ) : null}
          <button
            type="submit"
            form={formId}
            className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-3 py-1.5 text-xs font-bold uppercase text-white"
          >
            {slug === "consent" ? "Save & start therapy →" : "Save today's note"}
          </button>
        </div>
      </header>

      {/* Document pills */}
      <nav className="flex shrink-0 flex-wrap items-center gap-2 bg-[#12151c] px-4 py-2">
        <Link
          href={`${basePath}/consent`}
          className={[
            "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
            slug === "consent"
              ? "border-[#e6c987]/70 bg-[#c9a35c]/15 text-[#e6c987]"
              : consentSigned
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-[#2a2f3a] text-[#c8d2e0]/60 hover:text-white",
          ].join(" ")}
        >
          1. Consent{consentSigned ? " ✓" : ""}
        </Link>
        {consentSigned ? (
          <Link
            href={`${basePath}/soap-note`}
            className={[
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
              slug === "soap-note"
                ? "border-[#e6c987]/70 bg-[#c9a35c]/15 text-[#e6c987]"
                : "border-[#2a2f3a] text-[#c8d2e0]/60 hover:text-white",
            ].join(" ")}
          >
            2. Therapy sheet ({sessions.length} on file)
          </Link>
        ) : (
          <span className="rounded-full border border-[#2a2f3a] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c8d2e0]/30">
            2. Therapy sheet — sign consent first
          </span>
        )}
        <form action={sendCaseToNpFollowUp} className="ml-auto">
          <input type="hidden" name="case_id" value={caseId} />
          <button
            type="submit"
            className="rounded-md border border-[#c9a35c]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e6c987]/80 hover:bg-[#c9a35c]/10"
            title="Put this patient back in the nurse practitioner queue"
          >
            🩺 Send to NP follow-up
          </button>
        </form>
      </nav>

      <div className="flex-1 overflow-auto px-3">
        {slug === "consent" ? (
          <>
            {consentSigned ? (
              <p className="mx-auto mt-4 w-[816px] max-w-full rounded-sm border border-emerald-500/50 bg-emerald-950/40 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                ✓ Consent signed{" "}
                {consent?.signed_at
                  ? new Date(consent.signed_at as string).toLocaleDateString("en-US")
                  : ""}{" "}
                — one-time document, on file. Re-save only to correct it.
              </p>
            ) : null}
            <ConsentForTherapyForm
              caseId={caseId}
              patientId={patient.id}
              initial={(consent?.consent_json ?? {}) as Record<string, unknown>}
              patientName={patientName}
              today={today}
              ident={ident}
              formId={formId}
              navAfterSave={`${basePath}/soap-note`}
            />
          </>
        ) : (
          <>
            <TherapySoapNoteForm
              caseId={caseId}
              patientId={patient.id}
              patientName={patientName}
              today={today}
              formId={formId}
            />

            {/* Session history below today's sheet */}
            <section className="mx-auto mb-8 w-[816px] max-w-full rounded-xl border border-[#2a2f3a] bg-[#12151c] p-5">
              <h2 className="mb-3 font-serif text-lg font-semibold text-white">
                Session history
              </h2>
              {sessions.length === 0 ? (
                <p className="text-sm text-[#c8d2e0]/60">
                  No therapy sessions recorded yet — today&apos;s will be the first.
                </p>
              ) : (
                <ul className="divide-y divide-[#2a2f3a]">
                  {sessions.map((s) => {
                    const j = (s.session_json ?? {}) as Record<string, unknown>;
                    const lines = sessionProcedureLines(j);
                    const serviceText = lines.length
                      ? lines
                          .map(
                            (l) =>
                              `${SOAP_PROCEDURE_LABELS.get(l.code) ?? l.code} (${l.code}${l.units > 1 ? ` ×${l.units}` : ""})`,
                          )
                          .join(", ")
                      : "—";
                    return (
                      <li key={s.id as string} className="py-2.5">
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="text-sm font-semibold text-white">
                            {fmtDate(s.session_date as string)}
                          </p>
                          {typeof j.pain_level === "string" && j.pain_level !== "" ? (
                            <p className="text-xs text-[#c8d2e0]/60">
                              pain {j.pain_level}/10
                            </p>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-sm text-[#c8d2e0]/80">{serviceText}</p>
                        {typeof j.notes === "string" && j.notes ? (
                          <p className="mt-0.5 text-xs text-[#c8d2e0]/60">{j.notes}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
