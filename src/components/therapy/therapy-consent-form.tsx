import { saveTherapyConsentAction } from "@/app/therapy/cases/[id]/actions";
import { SignaturePad } from "@/components/signature-pad";

/**
 * Consent for therapy — patient signs once per case on the therapist iPad.
 * Placeholder fields until the practice's consent document is uploaded and
 * mapped, mirroring how the NP forms were staged.
 */
export function TherapyConsentForm({
  caseId,
  patientId,
  initial,
  signedAt,
}: {
  caseId: string;
  patientId: string;
  initial: Record<string, unknown>;
  signedAt: string | null;
}) {
  const str = (k: string) => (typeof initial[k] === "string" ? (initial[k] as string) : "");

  return (
    <section className="lux-card rounded-xl border border-vice-border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-semibold text-eggplant-900">
          Consent for therapy
        </h2>
        <p className="text-sm text-eggplant-500 mt-1">
          Patient acknowledgment and signature before the first therapy session.
          Full consent document upload coming next.
        </p>
        {signedAt ? (
          <p className="text-xs text-emerald-600 font-medium mt-2">
            ✓ Signed {new Date(signedAt).toLocaleString("en-US")}
          </p>
        ) : null}
      </div>

      <form action={saveTherapyConsentAction} className="space-y-4">
        <input type="hidden" name="case_id" value={caseId} />
        <input type="hidden" name="patient_id" value={patientId} />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-eggplant-700 mb-1">
            Patient name (print)
          </label>
          <input
            type="text"
            name="patient_name_print"
            defaultValue={str("patient_name_print")}
            className="w-full rounded-lg border border-vice-border bg-vice-surface px-3 py-2 text-sm text-eggplant-900 min-h-[40px]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-eggplant-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="signed_date"
            defaultValue={str("signed_date")}
            className="w-full rounded-lg border border-vice-border bg-vice-surface px-3 py-2 text-sm text-eggplant-900 min-h-[40px]"
          />
        </div>

        <SignaturePad
          name="patient_signature"
          label="Patient signature"
          initialDataUrl={str("patient_signature") || null}
        />

        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-sm font-bold text-white shadow-sm hover:shadow-md transition-shadow"
          >
            Save consent
          </button>
        </div>
      </form>
    </section>
  );
}
