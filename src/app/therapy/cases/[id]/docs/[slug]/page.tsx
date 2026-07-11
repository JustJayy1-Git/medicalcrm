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
  searchParams,
}: {
  params: Promise<{ id: string; slug: string }>;
  searchParams: Promise<{ billing?: string; view?: string }>;
}) {
  const { id: caseId, slug } = await params;
  const { billing, view } = await searchParams;
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

  // Step gate: the consent must be signed before the therapy sheet opens —
  // and once signed it is on file in the patient's folder, not editable here.
  if (slug === "soap-note" && !consentSigned) {
    redirect(`${basePath}/consent`);
  }
  if (slug === "consent" && consentSigned) {
    redirect(`${basePath}/soap-note`);
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

  // Read-only view of a previous session's full sheet.
  const viewedSession = view
    ? (sessions.find((s) => (s.id as string) === view) ?? null)
    : null;

  const billingBanner =
    billing === "failed"
      ? {
          tone: "border-red-500/50 bg-red-950/40 text-red-300",
          text: "Note saved, but billing capture failed — ask admin to press “Sync therapy billing” on the case, or enter charges manually.",
        }
      : billing?.startsWith("ok-")
        ? {
            tone: "border-emerald-500/50 bg-emerald-950/40 text-emerald-300",
            text: `✓ Note saved — ${billing.slice(3)} charge line(s) sent to billing for this date of service.`,
          }
        : billing === "dup"
          ? {
              tone: "border-[#c9a35c]/50 bg-[#c9a35c]/10 text-[#e6c987]",
              text: "Note saved — these procedures were already billed for this date, so no duplicate charges were created.",
            }
          : billing === "none"
            ? {
                tone: "border-[#2a2f3a] bg-[#12151c] text-[#c8d2e0]/70",
                text: "Note saved. No procedures were marked, so nothing was sent to billing.",
              }
            : null;

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
          {viewedSession ? (
            <Link
              href={`${basePath}/soap-note`}
              className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-3 py-1.5 text-xs font-bold uppercase text-white"
            >
              ← Back to today&apos;s note
            </Link>
          ) : (
            <button
              type="submit"
              form={formId}
              className="rounded-md bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] px-3 py-1.5 text-xs font-bold uppercase text-white"
            >
              {slug === "consent" ? "Save & start therapy →" : "Save today's note"}
            </button>
          )}
        </div>
      </header>

      {/* Document pills */}
      <nav className="flex shrink-0 flex-wrap items-center gap-2 bg-[#12151c] px-4 py-2">
        {consentSigned ? (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            1. Consent ✓ on file
          </span>
        ) : (
          <Link
            href={`${basePath}/consent`}
            className={[
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
              slug === "consent"
                ? "border-[#e6c987]/70 bg-[#c9a35c]/15 text-[#e6c987]"
                : "border-[#2a2f3a] text-[#c8d2e0]/60 hover:text-white",
            ].join(" ")}
          >
            1. Consent
          </Link>
        )}
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
        ) : (
          <>
            {billingBanner && !viewedSession ? (
              <p
                className={`mx-auto mt-4 w-[816px] max-w-full rounded-sm border px-3 py-2 text-[11px] font-semibold ${billingBanner.tone}`}
              >
                {billingBanner.text}
              </p>
            ) : null}

            {viewedSession ? (
              <>
                <p className="mx-auto mt-4 w-[816px] max-w-full rounded-sm border border-[#c9a35c]/50 bg-[#c9a35c]/10 px-3 py-2 text-[11px] font-semibold text-[#e6c987]">
                  Viewing the note from {fmtDate(viewedSession.session_date as string)} —
                  read-only, on file in the patient&apos;s folder.
                </p>
                <TherapySoapNoteForm
                  patientName={patientName}
                  today={today}
                  initial={(viewedSession.session_json ?? {}) as Record<string, unknown>}
                  sessionDate={viewedSession.session_date as string}
                  readOnly
                />
              </>
            ) : (
              <TherapySoapNoteForm
                caseId={caseId}
                patientId={patient.id}
                patientName={patientName}
                today={today}
                formId={formId}
              />
            )}

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
                      <li key={s.id as string}>
                        <Link
                          href={`${basePath}/soap-note?view=${s.id}`}
                          className="block rounded-md px-2 py-2.5 transition-colors hover:bg-white/5"
                        >
                          <div className="flex items-baseline justify-between gap-4">
                            <p className="text-sm font-semibold text-white">
                              {fmtDate(s.session_date as string)}
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#41B6E6]">
                                View sheet →
                              </span>
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
                        </Link>
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
