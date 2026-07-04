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

      {(
        [
          {
            key: "ready",
            title: "Ready for therapy",
            hint: "NP consultation finished — treat and log today's session.",
            rows: queue.filter((r) => one(r.consultation)?.status === "completed"),
          },
          {
            key: "waiting",
            title: "Waiting on NP consultation",
            hint: "Not yet seen by the nurse practitioner.",
            rows: queue.filter((r) => one(r.consultation)?.status !== "completed"),
          },
        ] as const
      ).map((section) =>
        section.rows.length === 0 ? null : (
          <section key={section.key} className="mb-10">
            <div className="flex items-baseline gap-3 mb-1">
              <h2 className="text-xl font-serif font-semibold text-eggplant-900">
                {section.title}
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-soft text-eggplant-800 border border-gold/40">
                {section.rows.length}
              </span>
            </div>
            <p className="text-xs text-eggplant-500 mb-3">{section.hint}</p>
            <ul className="space-y-3">
              {section.rows.map((row) => {
                const patient = one(row.patient);
                const consent = one(row.consent);
                const name = patient
                  ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
                  : "Patient";
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
                            Case {row.case_number ?? "—"} · DOI {fmtDate(row.date_of_injury)}{" "}
                            · DOB {fmtDate(patient?.date_of_birth)}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 ${
                            consentSigned
                              ? "bg-neon-mint-100 text-eggplant-800 border-neon-mint/30"
                              : "bg-neon-pink-100 text-neon-pink border-neon-pink-200"
                          }`}
                        >
                          {consentSigned ? "Consent signed" : "Needs consent"}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
