"use client";

export type ChartSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

const CHART_COLORS = {
  cyan: "#41B6E6",
  pink: "#DB3EB1",
  amber: "#F59E0B",
  mint: "#5EEAD4",
  plum: "#6B4C7A",
  slate: "#94A3B8",
} as const;

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

type DonutChartProps = {
  segments: ChartSegment[];
  size?: number;
  stroke?: number;
  centerTitle?: string;
  centerValue?: string;
  emptyLabel?: string;
};

export function DonutChart({
  segments,
  size = 168,
  stroke = 22,
  centerTitle,
  centerValue,
  emptyLabel = "No data yet",
}: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  if (total <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <svg width={size} height={size} className="opacity-40">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={stroke}
          />
        </svg>
        <p className="text-sm text-eggplant-400 mt-2">{emptyLabel}</p>
      </div>
    );
  }

  let offset = 0;
  const arcs = segments
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const frac = seg.value / total;
      const dash = frac * c;
      const gap = c - dash;
      const arc = (
        <circle
          key={seg.key}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-all duration-500"
        />
      );
      offset += dash;
      return arc;
    });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={centerTitle ?? "Chart"}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={stroke}
          />
          {arcs}
        </svg>
        {(centerTitle || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 pointer-events-none">
            {centerValue ? (
              <span className="text-2xl font-semibold text-eggplant-900 leading-none">
                {centerValue}
              </span>
            ) : null}
            {centerTitle ? (
              <span className="text-[10px] uppercase tracking-wider text-eggplant-500 mt-1">
                {centerTitle}
              </span>
            ) : null}
          </div>
        )}
      </div>
      <ul className="flex-1 w-full space-y-2 min-w-0">
        {segments
          .filter((seg) => seg.value > 0)
          .map((seg) => {
            const pct = Math.round((seg.value / total) * 100);
            return (
              <li key={seg.key} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden
                />
                <span className="font-medium text-eggplant-800 truncate flex-1">
                  {seg.label}
                </span>
                <span className="text-eggplant-500 tabular-nums shrink-0">
                  {seg.value} ({pct}%)
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

type BarItem = {
  key: string;
  label: string;
  value: number;
  sublabel?: string;
  color: string;
};

export function HorizontalBarChart({
  items,
  title,
}: {
  items: BarItem[];
  title?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div>
      {title ? (
        <h3 className="text-sm font-semibold text-eggplant-800 mb-4">{title}</h3>
      ) : null}
      <ul className="space-y-4">
        {items.map((item) => {
          const pct = Math.round((item.value / max) * 100);
          return (
            <li key={item.key}>
              <div className="flex justify-between text-sm mb-1.5 gap-2">
                <span className="font-medium text-eggplant-800">{item.label}</span>
                <span className="text-eggplant-900 font-semibold tabular-nums shrink-0">
                  {item.value.toLocaleString()}
                </span>
              </div>
              {item.sublabel ? (
                <p className="text-xs text-eggplant-500 -mt-1 mb-1.5">{item.sublabel}</p>
              ) : null}
              <div className="h-3 rounded-full bg-vice-surface overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(item.value > 0 ? 8 : 0, pct)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export type DashboardChartsProps = {
  activePatients: number;
  openCases: number;
  unbilledCount: number;
  unbilledTotal: number;
  awaitingCount: number;
  awaitingTotal: number;
  newCases: number;
  newPatients: number;
  monthLabel: string;
  referralBreakdown: { key: string; label: string; count: number }[];
};

const REFERRAL_PALETTE = [
  CHART_COLORS.cyan,
  CHART_COLORS.pink,
  CHART_COLORS.amber,
  CHART_COLORS.mint,
  CHART_COLORS.plum,
  CHART_COLORS.slate,
];

export function DashboardCharts({
  activePatients,
  openCases,
  unbilledCount,
  unbilledTotal,
  awaitingCount,
  awaitingTotal,
  newCases,
  newPatients,
  monthLabel,
  referralBreakdown,
}: DashboardChartsProps) {
  const referralsInNewCases = referralBreakdown.reduce((s, r) => s + r.count, 0);
  const withoutReferral = Math.max(0, newCases - referralsInNewCases);

  const referralSegments: ChartSegment[] = [
    ...referralBreakdown.map((row, i) => ({
      key: row.key,
      label: row.label,
      value: row.count,
      color: REFERRAL_PALETTE[i % REFERRAL_PALETTE.length],
    })),
    ...(withoutReferral > 0
      ? [
          {
            key: "unspecified",
            label: "Not specified",
            value: withoutReferral,
            color: CHART_COLORS.slate,
          },
        ]
      : []),
  ];

  const billingSegments: ChartSegment[] = [
    {
      key: "unbilled",
      label: "Unbilled charges",
      value: unbilledCount,
      color: CHART_COLORS.amber,
    },
    {
      key: "awaiting",
      label: "Awaiting payment",
      value: awaitingCount,
      color: CHART_COLORS.pink,
    },
  ].filter((s) => s.value > 0);

  const billingTotal = unbilledCount + awaitingCount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm">
        <h2 className="text-lg font-semibold text-eggplant-900 mb-1">Practice volume</h2>
        <p className="text-sm text-eggplant-500 mb-5">Treatment load and new intake</p>
        <HorizontalBarChart
          items={[
            {
              key: "active",
              label: "Active patients treating",
              value: activePatients,
              sublabel: `${openCases} open / active cases`,
              color: CHART_COLORS.cyan,
            },
            {
              key: "new-cases",
              label: `New cases (${monthLabel})`,
              value: newCases,
              sublabel: `${newPatients} new patient chart${newPatients === 1 ? "" : "s"}`,
              color: CHART_COLORS.mint,
            },
            {
              key: "open-cases",
              label: "Open / active cases",
              value: openCases,
              color: CHART_COLORS.plum,
            },
          ]}
        />
      </div>

      <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm">
        <h2 className="text-lg font-semibold text-eggplant-900 mb-1">Billing workload</h2>
        <p className="text-sm text-eggplant-500 mb-5">Charges waiting to go out vs. get paid</p>
        <DonutChart
          segments={billingSegments}
          centerValue={String(billingTotal)}
          centerTitle="charge lines"
          emptyLabel="No pending billing lines"
        />
        <div className="mt-4 pt-4 border-t border-vice-border grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-eggplant-500 text-xs uppercase tracking-wide">Unbilled</p>
            <p className="font-semibold text-eggplant-900">{unbilledCount}</p>
            <p className="text-xs text-eggplant-500">{formatMoney(unbilledTotal)}</p>
          </div>
          <div>
            <p className="text-eggplant-500 text-xs uppercase tracking-wide">Awaiting pay</p>
            <p className="font-semibold text-eggplant-900">{awaitingCount}</p>
            <p className="text-xs text-eggplant-500">{formatMoney(awaitingTotal)}</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm">
        <h2 className="text-lg font-semibold text-eggplant-900 mb-1">
          New cases & referrals
        </h2>
        <p className="text-sm text-eggplant-500 mb-5">
          {newCases} new case{newCases === 1 ? "" : "s"} — {monthLabel}
        </p>
        <DonutChart
          segments={referralSegments}
          centerValue={String(newCases)}
          centerTitle="new cases"
          emptyLabel="No new cases this month yet"
        />
      </div>
    </div>
  );
}
