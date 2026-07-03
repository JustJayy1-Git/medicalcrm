import { addTherapySessionAction } from "@/app/therapy/cases/[id]/actions";

/**
 * Therapy sheet — one entry per visit. Service list mirrors the practice's
 * common therapy CPTs; the real therapy sheet document will refine this.
 */
export function TherapySessionForm({
  caseId,
  patientId,
  services,
  defaultDate,
}: {
  caseId: string;
  patientId: string;
  services: ReadonlyArray<{ code: string; label: string }>;
  defaultDate: string;
}) {
  return (
    <section className="rounded-xl border border-[#2a2f3a] bg-[#121820] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Today&apos;s therapy sheet</h2>
        <p className="text-sm text-[#c8d2e0]/70 mt-1">
          Record what was done this visit. Saved sessions appear in the history below.
        </p>
      </div>

      <form action={addTherapySessionAction} className="space-y-4">
        <input type="hidden" name="case_id" value={caseId} />
        <input type="hidden" name="patient_id" value={patientId} />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
            Session date
          </label>
          <input
            type="date"
            name="session_date"
            required
            defaultValue={defaultDate}
            className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white min-h-[40px]"
          />
        </div>

        <fieldset>
          <legend className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-2">
            Services performed
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map((s) => (
              <label
                key={s.code}
                className="flex items-center gap-3 rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2.5 text-sm text-white cursor-pointer hover:border-[#41B6E6]/40"
              >
                <input
                  type="checkbox"
                  name="services"
                  value={s.code}
                  className="h-5 w-5 accent-[#41B6E6]"
                />
                <span>
                  {s.label}
                  <span className="text-[#c8d2e0]/50 ml-1.5 text-xs">({s.code})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
            Body areas treated
          </label>
          <input
            type="text"
            name="body_areas"
            placeholder="e.g. Cervical, lumbar, right shoulder"
            className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white min-h-[40px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration_minutes"
              min={0}
              step={5}
              placeholder="30"
              className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white min-h-[40px]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
              Pain level today (0–10)
            </label>
            <input
              type="number"
              name="pain_level"
              min={0}
              max={10}
              className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white min-h-[40px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
            Notes / patient response
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Tolerance, response to treatment, plan for next visit…"
            className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-sm font-bold text-white"
          >
            Save session
          </button>
        </div>
      </form>
    </section>
  );
}
