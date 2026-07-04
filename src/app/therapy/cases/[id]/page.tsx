import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsentForTherapyForm } from "@/components/therapy/consent-doc";
import { TherapySoapNoteForm } from "@/components/therapy/soap-note-doc";
import {
  getTherapyCase,
  listTherapySessions,
  SOAP_PROCEDURE_LABELS,
  sessionProcedureCodes,
} from "@/lib/therapy/therapy";
import { createClient } from "@/lib/supabase/server";
import { sendCaseToNpFollowUp } from "@/app/cases/[id]/followup-action";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US");
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TherapyCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: caseId } = await params;
  const supabase = await createClient();

  let caseRow: Awaited<ReturnType<typeof getTherapyCase>> = null;
  try {
    caseRow = await getTherapyCase(supabase, caseId);
  } catch {
    notFound();
  }
  if (!caseRow) notFound();

  const patient = one(caseRow.patient);
  const consultation = one(caseRow.consultation);
  const consent = one(caseRow.consent);
  if (!patient) notFound();

  const sessions = await listTherapySessions(supabase, caseId);

  const patientName = `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim();
  const today = new Date().toLocaleDateString("en-CA");
  const npDone = consultation?.status === "completed";
  const consentSigned = Boolean(consent?.signed_at);

  const ident = [
    { label: "Patient", value: patientName },
    { label: "Date of birth", value: fmtDate(patient.date_of_birth) },
    { label: "Case #", value: String(caseRow.case_number ?? "") },
    { label: "Date of injury", value: fmtDate(caseRow.date_of_injury) },
  ];

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <Link
        href="/therapy"
        className="text-sm text-neon-pink hover:text-eggplant-800 font-medium mb-4 inline-block"
      >
        ← Back to queue
      </Link>

      <header className="lux-card mb-6 rounded-xl border border-vice-border bg-white px-6 py-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-serif font-semibold text-eggplant-900">
            {patientName}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/therapy/cases/${caseId}/print`}
              className="px-3 py-1.5 text-xs border border-vice-border text-eggplant-800 rounded-md hover:bg-neon-mint-100 font-medium"
              title="Print therapy record (consent + session log)"
            >
              🖨 Print
            </Link>
            <form action={sendCaseToNpFollowUp}>
              <input type="hidden" name="case_id" value={caseId} />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs border border-gold/50 text-eggplant-800 rounded-md hover:bg-gold-soft font-medium"
                title="Put this patient back in the nurse practitioner queue"
              >
                🩺 Send to NP follow-up
              </button>
            </form>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Case #</dt>
            <dd className="text-eggplant-900 font-medium">{caseRow.case_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Date of birth</dt>
            <dd className="text-eggplant-900">{fmtDate(patient.date_of_birth)}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Date of injury</dt>
            <dd className="text-eggplant-900">{fmtDate(caseRow.date_of_injury)}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Phone</dt>
            <dd className="text-eggplant-900">{patient.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">NP consultation</dt>
            <dd className={npDone ? "text-emerald-600 font-medium" : "text-amber-600"}>
              {npDone ? "Completed" : "Not completed"}
            </dd>
          </div>
          <div>
            <dt className="text-eggplant-500 text-xs uppercase tracking-wider">Sessions logged</dt>
            <dd className="text-eggplant-900">{sessions.length}</dd>
          </div>
        </dl>
        {!npDone ? (
          <p className="mt-4 text-xs text-amber-700 border-t border-vice-border pt-4">
            Heads up: the nurse practitioner has not marked this consultation complete yet.
          </p>
        ) : null}
      </header>

      <div className="space-y-8">
        {consentSigned ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm text-emerald-800">
              ✓ <strong>Consent for therapy signed</strong>{" "}
              {consent?.signed_at
                ? new Date(consent.signed_at as string).toLocaleDateString("en-US")
                : ""}{" "}
              — one-time document, on file.
            </p>
            <Link
              href={`/therapy/cases/${caseId}/print`}
              className="text-xs font-bold uppercase tracking-wider text-emerald-700 hover:underline"
            >
              View / reprint
            </Link>
          </div>
        ) : (
          <section>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-neon-pink">
              First visit — have the patient sign before treatment
            </p>
            <ConsentForTherapyForm
              caseId={caseId}
              patientId={patient.id}
              initial={(consent?.consent_json ?? {}) as Record<string, unknown>}
              patientName={patientName}
              today={today}
              ident={ident}
            />
          </section>
        )}

        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-neon-pink">
            Today&apos;s visit — new Therapy SOAP Note
          </p>
          <TherapySoapNoteForm
            caseId={caseId}
            patientId={patient.id}
            patientName={patientName}
            today={today}
            ident={ident}
          />
        </section>

        <section className="lux-card rounded-xl border border-vice-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-serif font-semibold text-eggplant-900 mb-4">
            Session history
          </h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-eggplant-500">No therapy sessions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-vice-border">
              {sessions.map((s) => {
                const j = (s.session_json ?? {}) as Record<string, unknown>;
                const codes = sessionProcedureCodes(j);
                const serviceText = codes.length
                  ? codes
                      .map((c) => `${SOAP_PROCEDURE_LABELS.get(c) ?? c} (${c})`)
                      .join(", ")
                  : "—";
                return (
                  <li key={s.id as string} className="py-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-semibold text-eggplant-900">
                        {fmtDate(s.session_date as string)}
                      </p>
                      <p className="text-xs text-eggplant-500">
                        {typeof j.duration_minutes === "string" && j.duration_minutes
                          ? `${j.duration_minutes} min`
                          : ""}
                        {typeof j.pain_level === "string" && j.pain_level !== ""
                          ? ` · pain ${j.pain_level}/10`
                          : ""}
                      </p>
                    </div>
                    <p className="text-sm text-eggplant-700 mt-1">{serviceText}</p>
                    {typeof j.body_areas === "string" && j.body_areas ? (
                      <p className="text-xs text-eggplant-500 mt-0.5">
                        Areas: {j.body_areas}
                      </p>
                    ) : null}
                    {typeof j.notes === "string" && j.notes ? (
                      <p className="text-xs text-eggplant-500 mt-0.5">{j.notes}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
