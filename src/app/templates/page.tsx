import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplatesLibrary } from "@/components/templates-library";
import { TEMPLATE_SELECT } from "@/lib/document-template";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const supabase = await createClient();
const { data: templates, error } = await supabase
    .from("document_templates")
    .select(TEMPLATE_SELECT)
    .order("sort_rank", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-2">
            Templates
          </p>
          <h1 className="text-3xl font-serif font-semibold text-eggplant-900">
            Office templates
          </h1>
          <p className="text-sm text-vice-muted mt-1 max-w-2xl">
            PDF forms and letters for patient physical files, mail, and email.
            Upload once — your team can open and print from here.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error.message.includes("document_templates") ? (
              <>
                Run migration{" "}
                <code className="text-xs bg-red-100 px-1 rounded">
                  0013_document_templates.sql
                </code>{" "}
                in Supabase SQL Editor, then refresh.
              </>
            ) : (
              error.message
            )}
          </div>
        )}

        <TemplatesLibrary initial={templates ?? []} />
      </div>
);
}
