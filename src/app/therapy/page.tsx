import Link from "next/link";
import { listTherapyQueue } from "@/lib/therapy/therapy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US");
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TherapyQueuePage() {
  const supabase = await createClient();
  let queue: Awaited<ReturnType<typeof listTherapyQueue>> = [];
  let loadError: string | null = null;

  try {
    queue = await listTherapyQueue(supabase);
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "Could not load therapy queue. Run migration 0021 in Supabase.";
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-3">
        Post-consultation workflow
      </p>
      <h1 className="text-3xl font-serif font-semibold text-eggplant-900 mb-2">
        Therapy queue
      </h1>
      <p className="text-eggplant-500 mb-8 max-w-2xl">
        Open the patient to record today&apos;s therapy sheet. First visit: have the
        patient sign the consent for therapy before treatment.
      </p>

      {loadError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      {queue.length === 0 && !loadError ? (
        <p className="lux-card rounded-xl border border-vice-border bg-white px-6 py-10 text-center text-eggplant-500 shadow-sm">
          No open cases yet. Patients appear here once intake creates their case.
        </p>
      ) : null}

      <ul className="space-y-3">
        {queue.map((row) => {
          const patient = one(row.patient);
          const consultation = one(row.consultation);
          const consent = one(row.consent);
          const name = patient
            ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
            : "Patient";
          const npDone = consultation?.status === "completed";
          const consentSigned = Boolean(consent?.signed_at);

          return (
            <li key={row.id as string}>
              <Link
                href={`/therapy/cases/${row.id}`}
                className="lux-card block rounded-xl border border-vice-border bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-eggplant-900">
                      {name || "Patient"}
                    </p>
                    <p className="text-sm text-eggplant-500 mt-0.5">
                      Case {row.case_number ?? "—"} · DOI {fmtDate(row.date_of_injury)} · DOB{" "}
                      {fmtDate(patient?.date_of_birth)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        npDone
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}
                    >
                      {npDone ? "NP done" : "NP pending"}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        consentSigned
                          ? "bg-neon-mint-100 text-eggplant-800 border-neon-mint/30"
                          : "bg-neon-pink-100 text-neon-pink border-neon-pink-200"
                      }`}
                    >
                      {consentSigned ? "Consent signed" : "Needs consent"}
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
