import Link from "next/link";
import { listClinicalQueue } from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US");
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

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-3">
        Post-intake workflow
      </p>
      <h1 className="text-3xl font-serif font-semibold text-eggplant-900 mb-2">
        Consultation queue
      </h1>
      <p className="text-eggplant-500 mb-8 max-w-2xl">
        Patients appear here after iPad intake is finished — and again when a
        follow-up is requested. Complete NOFA, EMC, and Initial Report with the
        patient before admin billing work begins.
      </p>

      {loadError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      {queue.length === 0 && !loadError ? (
        <p className="lux-card rounded-xl border border-vice-border bg-white px-6 py-10 text-center text-eggplant-500 shadow-sm">
          No patients waiting for consultation. New intakes will show up here when
          the packet is completed on the iPad.
        </p>
      ) : null}

      <ul className="space-y-3">
        {queue.map((row) => {
          const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
          const caseRow = Array.isArray(row.case) ? row.case[0] : row.case;
          const name = patient
            ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
            : "Patient";
          const caseId = caseRow?.id as string | undefined;
          if (!caseId) return null;
          const isFollowUp = (row as { visit_kind?: string }).visit_kind === "follow_up";

          return (
            <li key={row.id as string}>
              <Link
                href={`/clinical/cases/${caseId}`}
                className="lux-card block rounded-xl border border-vice-border bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-eggplant-900">
                      {name || "Patient"}
                    </p>
                    <p className="text-sm text-eggplant-500 mt-0.5">
                      Case {caseRow?.case_number ?? "—"} · DOI {fmtDate(caseRow?.date_of_injury)}{" "}
                      · DOB {fmtDate(patient?.date_of_birth)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isFollowUp ? (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gold-soft text-eggplant-800 border border-gold/40">
                        Follow-up
                      </span>
                    ) : null}
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neon-mint-100 text-eggplant-800 border border-neon-mint/30">
                      {(row.status as string) === "in_progress" ? "In progress" : "Waiting"}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
