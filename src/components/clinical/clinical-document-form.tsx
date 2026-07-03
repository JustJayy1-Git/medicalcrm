import { saveClinicalDocument } from "@/app/clinical/cases/[id]/actions";
import { SignaturePad } from "@/components/signature-pad";

type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "date" | "textarea" | "signature";
  placeholder?: string;
};

export function ClinicalDocumentForm({
  caseId,
  section,
  title,
  subtitle,
  fields,
  initial,
  completedAt,
}: {
  caseId: string;
  section: "nofa" | "emc" | "initial_report";
  title: string;
  subtitle: string;
  fields: FieldDef[];
  initial: Record<string, unknown>;
  completedAt: string | null;
}) {
  return (
    <section className="rounded-xl border border-[#2a2f3a] bg-[#121820] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-[#c8d2e0]/70 mt-1">{subtitle}</p>
        {completedAt ? (
          <p className="text-xs text-[#7fdf7f] mt-2">
            Completed {new Date(completedAt).toLocaleString("en-US")}
          </p>
        ) : null}
      </div>

      <form action={saveClinicalDocument} className="space-y-4">
        <input type="hidden" name="case_id" value={caseId} />
        <input type="hidden" name="section" value={section} />
        {fields.map((f) =>
          f.type === "signature" ? (
            <SignaturePad
              key={f.name}
              name={f.name}
              label={f.label}
              initialDataUrl={
                typeof initial[f.name] === "string" ? (initial[f.name] as string) : null
              }
            />
          ) : (
          <div key={f.name}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#c8d2e0]/80 mb-1">
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <textarea
                name={f.name}
                rows={4}
                defaultValue={String(initial[f.name] ?? "")}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white"
              />
            ) : (
              <input
                type={f.type ?? "text"}
                name={f.name}
                defaultValue={String(initial[f.name] ?? "")}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-[#2a2f3a] bg-[#0c0f15] px-3 py-2 text-sm text-white min-h-[40px]"
              />
            )}
          </div>
          ),
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg border border-[#2a2f3a] text-sm font-semibold text-white hover:border-[#41B6E6]/50"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="_complete"
            value="1"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-sm font-bold text-white"
          >
            Save & mark complete
          </button>
        </div>
      </form>
    </section>
  );
}
