import Link from "next/link";

export const dynamic = "force-dynamic";

const REPORTS = [
  {
    href: "/reports/cms-1500",
    title: "CMS-1500 (HCFA) claim form",
    description:
      "Print daily health insurance claim forms for the carrier (not for attorneys).",
    status: "live" as const,
  },
  {
    href: "/reports/attorney-ledger",
    title: "Attorney account ledger",
    description:
      "Charges and payments by insurance company — Medisoft-style ledger for counsel.",
    status: "live" as const,
  },
  {
    href: "/cases",
    title: "Treatment charge summary",
    description:
      "Open a case → Treatment charges → Print treatment summary (DOS detail, no 1500).",
    status: "live" as const,
  },
  {
    href: "/reports/ar-aging",
    title: "A/R aging by carrier",
    description:
      "Medisoft-style 30/60/90 buckets — open balances grouped by insurance company.",
    status: "live" as const,
  },
  {
    href: "/billing/payments",
    title: "Post insurance payment",
    description: "Apply payer amounts to charge lines; reduces aging balances.",
    status: "live" as const,
  },
];

export default function ReportsPage() {
  return (
    <section className="px-6 py-6 max-w-3xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-pink mb-1">
        Reports
      </p>
      <h1 className="text-2xl font-serif font-semibold text-eggplant-900 mb-2">
        Billing reports
      </h1>
      <p className="text-sm text-eggplant-700 mb-8">
        <strong>Insurance</strong> gets CMS-1500 forms. <strong>Attorneys</strong> get
        ledgers and treatment summaries — never HCFA copies.
      </p>

      <ul className="space-y-3">
        {REPORTS.map((r) => (
          <li key={r.title}>
            {r.status === "live" && r.href !== "#" ? (
              <Link
                href={r.href}
                className="block p-4 rounded-xl border border-vice-border bg-white hover:border-neon-mint-200 hover:shadow-sm transition-shadow"
              >
                <ReportCard {...r} />
              </Link>
            ) : (
              <article className="block p-4 rounded-xl border border-vice-border bg-vice-surface opacity-80">
                <ReportCard {...r} />
              </article>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReportCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: "live" | "soon";
}) {
  return (
    <>
      <p className="flex items-center gap-2">
        <span className="font-semibold text-eggplant-900">{title}</span>
        {status === "live" ? (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Ready
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-vice-border text-eggplant-700">
            Soon
          </span>
        )}
      </p>
      <p className="text-sm text-eggplant-700 mt-1">{description}</p>
    </>
  );
}
