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
    <div className="p-8 max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#41B6E6] mb-2">
        Post-consultation workflow
      </p>
      <h1 className="text-3xl font-serif font-semibold text-white mb-2">
        Therapy queue
      </h1>
      <p className="text-[#c8d2e0]/80 text-sm mb-8 max-w-2xl">
        Open the patient to record today&apos;s therapy sheet. First visit: have the
        patient sign the consent for therapy before treatment.
      </p>

      {loadError ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </p>
      ) : null}

      {queue.length === 0 && !loadError ? (
        <p className="rounded-xl border border-[#2a2f3a] bg-[#121820] px-6 py-10 text-center text-[#c8d2e0]/70">
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
                className="block rounded-xl border border-[#2a2f3a] bg-[#121820] px-5 py-4 hover:border-[#41B6E6]/50 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{name || "Patient"}</p>
                    <p className="text-sm text-[#c8d2e0]/70 mt-0.5">
                      Case {row.case_number ?? "—"} · DOI {fmtDate(row.date_of_injury)} · DOB{" "}
                      {fmtDate(patient?.date_of_birth)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        npDone
                          ? "bg-[#7fdf7f]/10 text-[#7fdf7f] border-[#7fdf7f]/30"
                          : "bg-amber-400/10 text-amber-300 border-amber-400/30"
                      }`}
                    >
                      {npDone ? "NP done" : "NP pending"}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        consentSigned
                          ? "bg-[#41B6E6]/15 text-[#41B6E6] border-[#41B6E6]/30"
                          : "bg-[#DB3EB1]/10 text-[#e878c8] border-[#DB3EB1]/30"
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
