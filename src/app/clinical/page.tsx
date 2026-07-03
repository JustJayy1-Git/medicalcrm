import Link from "next/link";
import { listClinicalQueue } from "@/lib/clinical/consultation";
import { packetForVisitKind } from "@/lib/clinical/doc-slugs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US");
}

type QueueRow = Awaited<ReturnType<typeof listClinicalQueue>>[number];

function QueueCard({ row }: { row: QueueRow }) {
  const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
  const caseRow = Array.isArray(row.case) ? row.case[0] : row.case;
  const name = patient
    ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
    : "Patient";
  const caseId = caseRow?.id as string | undefined;
  if (!caseId) return null;
  const visitKind = (row as { visit_kind?: string }).visit_kind ?? "initial";
  const firstDoc = packetForVisitKind(visitKind)[0];

  return (
    <li>
      <Link
        href={`/clinical/cases/${caseId}/docs/${firstDoc}`}
        className="lux-card block rounded-xl border border-vice-border bg-white px-5 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-eggplant-900">{name || "Patient"}</p>
            <p className="text-sm text-eggplant-500 mt-0.5">
              Case {caseRow?.case_number ?? "—"} · DOI {fmtDate(caseRow?.date_of_injury)} · DOB{" "}
              {fmtDate(patient?.date_of_birth)}
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neon-mint-100 text-eggplant-800 border border-neon-mint/30 shrink-0">
            {(row.status as string) === "in_progress" ? "In progress" : "Waiting"}
          </span>
        </div>
      </Link>
    </li>
  );
}

export default async function ClinicalQueuePage() {
  const supabase = await createClient();
  let queue: Awaited<ReturnType<typeof listClinicalQueue>> = [];
  let loadError: string | null = null;

  try {
    queue = await listClinicalQueue(supabase);
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "Could not load consultation queue. Run migration 0020 in Supabase.";
  }

  const initials = queue.filter(
    (r) => ((r as { visit_kind?: string }).visit_kind ?? "initial") !== "follow_up",
  );
  const followUps = queue.filter(
    (r) => (r as { visit_kind?: string }).visit_kind === "follow_up",
  );

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-3">
        Post-intake workflow
      </p>
      <h1 className="text-3xl font-serif font-semibold text-eggplant-900 mb-2">
        Consultation queues
      </h1>
      <p className="text-eggplant-500 mb-8 max-w-2xl">
        New patients appear under Initial consultation after iPad intake — complete
        the Initial Evaluation, EMC, and No-Fault with the patient. Returning
        patients appear under Follow-ups with a single follow-up report.
      </p>

      {loadError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <section className="mb-10">
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-xl font-serif font-semibold text-eggplant-900">
            Initial consultation queue
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-soft text-eggplant-800 border border-gold/40">
            {initials.length}
          </span>
        </div>
        {initials.length === 0 && !loadError ? (
          <p className="lux-card rounded-xl border border-vice-border bg-white px-6 py-8 text-center text-eggplant-500 shadow-sm">
            No patients waiting for an initial consultation. New iPad intakes show up
            here automatically.
          </p>
        ) : (
          <ul className="space-y-3">
            {initials.map((row) => (
              <QueueCard key={row.id as string} row={row} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-xl font-serif font-semibold text-eggplant-900">Follow-ups</h2>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neon-pink-100 text-neon-pink border border-neon-pink-200">
            {followUps.length}
          </span>
        </div>
        {followUps.length === 0 && !loadError ? (
          <p className="lux-card rounded-xl border border-vice-border bg-white px-6 py-8 text-center text-eggplant-500 shadow-sm">
            No follow-up visits waiting. Staff or the therapist can send a treating
            patient back here for re-evaluation.
          </p>
        ) : (
          <ul className="space-y-3">
            {followUps.map((row) => (
              <QueueCard key={row.id as string} row={row} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
