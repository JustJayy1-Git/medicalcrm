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
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatMoneyCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return formatMoney(n);
}

type DonutChartProps = {
  segments: ChartSegment[];
  size?: number;
  stroke?: number;
  centerTitle?: string;
  centerValue?: string;
  emptyLabel?: string;
  formatLegendValue?: (value: number) => string;
};

export function DonutChart({
  segments,
  size = 168,
  stroke = 22,
  centerTitle,
  centerValue,
  emptyLabel = "No data yet",
  formatLegendValue = (v) => String(v),
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
              <span className="text-xl font-semibold text-eggplant-900 leading-none">
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
                <span className="text-eggplant-500 tabular-nums shrink-0 text-right">
                  {formatLegendValue(seg.value)} ({pct}%)
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export type DashboardChartsProps = {
  year: number;
  ytdTotal: number;
  ytdByMonth: { key: string; label: string; total: number }[];
  newCases: number;
  monthLabel: string;
  referralBreakdown: { key: string; label: string; count: number }[];
};

const CHART_PALETTE = [
  CHART_COLORS.cyan,
  CHART_COLORS.pink,
  CHART_COLORS.amber,
  CHART_COLORS.mint,
  CHART_COLORS.plum,
  CHART_COLORS.slate,
];

export function DashboardCharts({
  year,
  ytdTotal,
  ytdByMonth,
  newCases,
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
      color: CHART_PALETTE[i % CHART_PALETTE.length],
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

  const ytdSegments: ChartSegment[] = ytdByMonth.map((row, i) => ({
    key: row.key,
    label: row.label,
    value: row.total,
    color: CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="p-6 rounded-xl bg-white border border-vice-border shadow-sm">
        <h2 className="text-lg font-semibold text-eggplant-900 mb-1">
          Year-to-date payments
        </h2>
        <p className="text-sm text-eggplant-500 mb-5">
          Posted payments in {year}, by month
        </p>
        <DonutChart
          segments={ytdSegments}
          centerValue={formatMoneyCompact(ytdTotal)}
          centerTitle="YTD total"
          emptyLabel="No payments posted this year yet"
          formatLegendValue={formatMoney}
        />
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
