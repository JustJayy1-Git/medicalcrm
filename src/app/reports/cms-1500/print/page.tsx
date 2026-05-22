import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintToolbar } from "@/components/cms1500/print-toolbar";
import { Cms1500PdfViewer } from "@/components/cms1500/cms1500-pdf-viewer";
import {
  fetchAllClaimsForCase,
  fetchClaimsForCaseDos,
} from "@/lib/cms1500/fetch";
import { cms1500TemplateReady } from "@/lib/cms1500/pdf-fill";
import { formatIsoDateDisplay } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function Cms1500PrintPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string; dos?: string; all?: string }>;
}) {
  const { caseId, dos, all } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!caseId) {
    return (
      <section className="p-8 text-center text-eggplant-700">
        Missing case.{" "}
        <Link href="/reports/cms-1500" className="text-neon-pink">
          Pick a case
        </Link>
      </section>
    );
  }

  let pageCount = 0;
  if (all === "1") {
    const batches = await fetchAllClaimsForCase(supabase, caseId);
    pageCount = batches.reduce((n, b) => n + b.claims.length, 0);
  } else if (dos) {
    const claims = await fetchClaimsForCaseDos(supabase, caseId, dos);
    pageCount = claims.length;
  }

  const templateReady = cms1500TemplateReady();
  const pdfParams = new URLSearchParams({ caseId });
  if (all === "1") pdfParams.set("all", "1");
  else if (dos) pdfParams.set("dos", dos);
  const pdfUrl = `/api/cms-1500/pdf?${pdfParams.toString()}`;

  return (
    <div className="cms-print-root min-h-screen">
      <PrintToolbar
        backHref={`/reports/cms-1500?caseId=${encodeURIComponent(caseId)}`}
        pageCount={pageCount}
        pdfUrl={pageCount > 0 && templateReady ? pdfUrl : undefined}
      />

      {!templateReady ? (
        <section className="cms-no-print p-8 max-w-lg mx-auto text-sm text-eggplant-700">
          <p className="mb-2 font-medium text-eggplant-900">Blank form not installed</p>
          <p className="mb-4">
            Copy your Desktop CMS1500.pdf into the project:
          </p>
          <pre className="text-xs bg-neon-mint-100 p-3 rounded border border-vice-border overflow-x-auto">
            npm run cms1500:copy-blank
          </pre>
          <p className="mt-4 text-xs">
            Source: C:\Users\Stric\Desktop\CMS1500.pdf → public/cms-1500-blank.pdf
          </p>
        </section>
      ) : pageCount === 0 ? (
        <section className="cms-no-print p-8 max-w-lg mx-auto text-sm text-eggplant-700">
          <p className="mb-2">
            No visit with charges found for this case and date. Enter charges in
            transaction entry first (max 6 CPT codes per treatment day).
          </p>
          <Link
            href={`/cases/${caseId}/visits/new`}
            className="text-neon-pink font-medium hover:underline"
          >
            Open transaction entry
          </Link>
        </section>
      ) : (
        <Cms1500PdfViewer pdfUrl={pdfUrl} pageCount={pageCount} />
      )}

      {dos && pageCount > 0 ? (
        <p className="cms-no-print text-center text-xs text-vice-muted pb-4">
          Treatment day: {formatIsoDateDisplay(dos)}
        </p>
      ) : null}
    </div>
  );
}
