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
    <section className="rounded-xl border border-[#2a2f3a] bg-[#121820] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Consent for therapy</h2>
        <p className="text-sm text-[#c8d2e0]/70 mt-1">
          Patient acknowledgment and signature before the first therapy session.
          Full consent document upload coming next.
        </p>
        {signedAt ? (
          <p className="text-xs text-[#7fdf7f] mt-2">
            Signed {new Date(signedAt).toLocaleString("en-US")}
          </p>
        ) : null}
      </div>

      <form action={saveTherapyConsentAction} className="space-y-4">
        <input type="hidden" name="case_id" value={caseId} />
        <input type="hidden" name="patient_id" value={patientId} />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
            Patient name (print)
          </label>
          <input
            type="text"
            name="patient_name_print"
            defaultValue={str("patient_name_print")}
            className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white min-h-[40px]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
            Date
          </label>
          <input
            type="date"
            name="signed_date"
            defaultValue={str("signed_date")}
            className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white min-h-[40px]"
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
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-sm font-bold text-white"
          >
            Save consent
          </button>
        </div>
      </form>
    </section>
  );
}
