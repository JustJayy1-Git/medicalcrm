import Link from "next/link";
import { notFound } from "next/navigation";
import { TherapyConsentForm } from "@/components/therapy/therapy-consent-form";
import { TherapySessionForm } from "@/components/therapy/therapy-session-form";
import {
  getTherapyCase,
  listTherapySessions,
  THERAPY_SERVICES,
} from "@/lib/therapy/therapy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US");
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const SERVICE_LABELS = new Map<string, string>(
  THERAPY_SERVICES.map((s) => [s.code, s.label]),
);

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

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/therapy"
        className="text-sm text-[#41B6E6] hover:text-white mb-4 inline-block"
      >
        ← Back to queue
      </Link>

      <header className="mb-8 rounded-xl border border-[#2a2f3a] bg-[#121820] px-6 py-5">
        <h1 className="text-2xl font-serif font-semibold text-white">{patientName}</h1>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Case #</dt>
            <dd className="text-white font-medium">{caseRow.case_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Date of birth</dt>
            <dd className="text-white">{fmtDate(patient.date_of_birth)}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Date of injury</dt>
            <dd className="text-white">{fmtDate(caseRow.date_of_injury)}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Phone</dt>
            <dd className="text-white">{patient.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">NP consultation</dt>
            <dd className={npDone ? "text-[#7fdf7f]" : "text-amber-300"}>
              {npDone ? "Completed" : "Not completed"}
            </dd>
          </div>
          <div>
            <dt className="text-[#c8d2e0]/50 text-xs uppercase tracking-wider">Sessions logged</dt>
            <dd className="text-white">{sessions.length}</dd>
          </div>
        </dl>
        {!npDone ? (
          <p className="mt-4 text-xs text-amber-300/90 border-t border-[#2a2f3a] pt-4">
            Heads up: the nurse practitioner has not marked this consultation complete yet.
          </p>
        ) : null}
      </header>

      <div className="space-y-8">
        <TherapyConsentForm
          caseId={caseId}
          patientId={patient.id}
          initial={(consent?.consent_json ?? {}) as Record<string, unknown>}
          signedAt={(consent?.signed_at as string | null) ?? null}
        />

        <TherapySessionForm
          caseId={caseId}
          patientId={patient.id}
          services={THERAPY_SERVICES}
          defaultDate={today}
        />

        <section className="rounded-xl border border-[#2a2f3a] bg-[#121820] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Session history</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-[#c8d2e0]/60">No therapy sessions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-[#2a2f3a]">
              {sessions.map((s) => {
                const j = (s.session_json ?? {}) as Record<string, unknown>;
                const codes = Array.isArray(j.services) ? (j.services as string[]) : [];
                const serviceText = codes.length
                  ? codes.map((c) => SERVICE_LABELS.get(c) ?? c).join(", ")
                  : "—";
                return (
                  <li key={s.id as string} className="py-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-semibold text-white">
                        {fmtDate(s.session_date as string)}
                      </p>
                      <p className="text-xs text-[#c8d2e0]/50">
                        {typeof j.duration_minutes === "string" && j.duration_minutes
                          ? `${j.duration_minutes} min`
                          : ""}
                        {typeof j.pain_level === "string" && j.pain_level !== ""
                          ? ` · pain ${j.pain_level}/10`
                          : ""}
                      </p>
                    </div>
                    <p className="text-sm text-[#c8d2e0]/80 mt-1">{serviceText}</p>
                    {typeof j.body_areas === "string" && j.body_areas ? (
                      <p className="text-xs text-[#c8d2e0]/60 mt-0.5">
                        Areas: {j.body_areas}
                      </p>
                    ) : null}
                    {typeof j.notes === "string" && j.notes ? (
                      <p className="text-xs text-[#c8d2e0]/60 mt-0.5">{j.notes}</p>
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
