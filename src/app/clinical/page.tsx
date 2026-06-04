import Link from "next/link";
import { listClinicalQueue } from "@/lib/clinical/consultation";
import { createClient } from "@/lib/supabase/server";

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
    <div className="p-8 max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#41B6E6] mb-2">
        Post-intake workflow
      </p>
      <h1 className="text-3xl font-serif font-semibold text-white mb-2">
        Consultation queue
      </h1>
      <p className="text-[#c8d2e0]/80 text-sm mb-8 max-w-2xl">
        Patients appear here after iPad intake is finished. Complete NOFA, EMC, and Initial
        Report with the patient before admin billing work begins.
      </p>

      {loadError ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </p>
      ) : null}

      {queue.length === 0 && !loadError ? (
        <p className="rounded-xl border border-[#2a2f3a] bg-[#121820] px-6 py-10 text-center text-[#c8d2e0]/70">
          No patients waiting for consultation. New intakes will show up here when the packet is
          completed on the iPad.
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

          return (
            <li key={row.id as string}>
              <Link
                href={`/clinical/cases/${caseId}`}
                className="block rounded-xl border border-[#2a2f3a] bg-[#121820] px-5 py-4 hover:border-[#41B6E6]/50 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{name || "Patient"}</p>
                    <p className="text-sm text-[#c8d2e0]/70 mt-0.5">
                      Case {caseRow?.case_number ?? "—"} · DOI {fmtDate(caseRow?.date_of_injury)}{" "}
                      · DOB {fmtDate(patient?.date_of_birth)}
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#41B6E6]/15 text-[#41B6E6] border border-[#41B6E6]/30">
                    {(row.status as string) === "in_progress" ? "In progress" : "Waiting"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
