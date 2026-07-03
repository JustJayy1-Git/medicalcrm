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
    <section className="lux-card rounded-xl border border-vice-border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-semibold text-eggplant-900">{title}</h2>
        <p className="text-sm text-eggplant-500 mt-1">{subtitle}</p>
        {completedAt ? (
          <p className="text-xs text-emerald-600 font-medium mt-2">
            ✓ Completed {new Date(completedAt).toLocaleString("en-US")}
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-eggplant-700 mb-1">
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <textarea
                name={f.name}
                rows={4}
                defaultValue={String(initial[f.name] ?? "")}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-vice-border bg-vice-surface px-3 py-2 text-sm text-eggplant-900 placeholder-vice-muted"
              />
            ) : (
              <input
                type={f.type ?? "text"}
                name={f.name}
                defaultValue={String(initial[f.name] ?? "")}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-vice-border bg-vice-surface px-3 py-2 text-sm text-eggplant-900 placeholder-vice-muted min-h-[40px]"
              />
            )}
          </div>
          ),
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg border border-vice-border text-sm font-semibold text-eggplant-800 hover:border-neon-mint hover:bg-neon-mint-100 transition-colors"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="_complete"
            value="1"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-sm font-bold text-white shadow-sm hover:shadow-md transition-shadow"
          >
            Save & mark complete
          </button>
        </div>
      </form>
    </section>
  );
}
