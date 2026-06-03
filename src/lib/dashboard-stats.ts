import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPortalPlaceholderPatient,
  portalPlaceholderPatientFilter,
} from "@/lib/patient-placeholder";

export type ReferralRow = {
  key: string;
  label: string;
  count: number;
};

export type MonthlyActivity = {
  monthLabel: string;
  newCases: number;
  newPatients: number;
  referralBreakdown: ReferralRow[];
};

export type YtdMonthPayment = {
  key: string;
  label: string;
  total: number;
};

export type YtdPayments = {
  year: number;
  total: number;
  byMonth: YtdMonthPayment[];
};

export type DashboardSnapshot = {
  activePatientsTreating: number;
  openActiveCases: number;
  unbilledChargeCount: number;
  unbilledChargeTotal: number;
  billedAwaitingPaymentCount: number;
  billedAwaitingPaymentBalance: number;
  monthly: MonthlyActivity;
  ytdPayments: YtdPayments;
};

const REFERRAL_LABELS: Record<string, string> = {
  attorney: "Attorney",
  friend_family: "Friend / family",
  google: "Google / search",
  social_media: "Social media",
  prior_patient: "Prior patient",
  other: "Other",
  unknown: "Not specified",
};

export function currentMonthRange(asOf = new Date()) {
  const y = asOf.getFullYear();
  const m = asOf.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const monthLabel = asOf.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  return { start, end, monthLabel };
}

function normalizeReferralKey(raw: string | null | undefined): string {
  if (!raw?.trim()) return "unknown";
  const t = raw.trim();
  try {
    const parsed = JSON.parse(t) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return String(parsed[0]).toLowerCase().replace(/\s+/g, "_");
    }
  } catch {
    /* plain text */
  }
  if (t.startsWith("[") && t.includes("attorney")) return "attorney";
  const first = t.split(",")[0]?.trim().toLowerCase().replace(/\s+/g, "_") ?? "";
  if (REFERRAL_LABELS[first]) return first;
  if (first.length > 0 && first.length < 40) return first;
  return "other";
}

function referralLabel(key: string, raw?: string | null): string {
  if (REFERRAL_LABELS[key]) return REFERRAL_LABELS[key];
  if (raw?.trim() && key === "other") return raw.trim().slice(0, 48);
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isRealPatient(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): boolean {
  return !isPortalPlaceholderPatient(firstName, lastName);
}

export async function fetchMonthlyActivity(
  supabase: SupabaseClient,
): Promise<MonthlyActivity> {
  const { start, end, monthLabel } = currentMonthRange();

  const [{ data: monthCases }, { data: monthPatients }] = await Promise.all([
    supabase
      .from("cases")
      .select(
        `id, referral_source, created_at,
         patient:patients(first_name, last_name)`,
      )
      .gte("created_at", `${start}T00:00:00.000Z`)
      .lte("created_at", `${end}T23:59:59.999Z`),
    supabase
      .from("patients")
      .select("id, first_name, last_name, created_at")
      .or(portalPlaceholderPatientFilter())
      .gte("created_at", `${start}T00:00:00.000Z`)
      .lte("created_at", `${end}T23:59:59.999Z`),
  ]);

  const realCases = (monthCases ?? []).filter((row) => {
    const p = Array.isArray(row.patient) ? row.patient[0] : row.patient;
    return p && isRealPatient(p.first_name, p.last_name);
  });

  const referralCounts = new Map<string, { label: string; count: number }>();

  for (const row of realCases) {
    const raw = row.referral_source as string | null;
    if (!raw?.trim()) continue;
    const key = normalizeReferralKey(raw);
    const label = referralLabel(key, raw);
    const prev = referralCounts.get(key);
    if (prev) prev.count += 1;
    else referralCounts.set(key, { label, count: 1 });
  }

  const referralBreakdown = [...referralCounts.entries()]
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count);

  return {
    monthLabel,
    newCases: realCases.length,
    newPatients: monthPatients?.length ?? 0,
    referralBreakdown,
  };
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export async function fetchYtdPayments(
  supabase: SupabaseClient,
  asOf = new Date(),
): Promise<YtdPayments> {
  const year = asOf.getFullYear();
  const start = `${year}-01-01`;

  const { data: paidCharges } = await supabase
    .from("charges")
    .select("paid, paid_date")
    .gte("paid_date", start)
    .gt("paid", 0)
    .limit(5000);

  const byMonth = new Map<number, number>();
  for (const row of paidCharges ?? []) {
    if (!row.paid_date) continue;
    const monthIndex = Number(String(row.paid_date).slice(5, 7)) - 1;
    if (monthIndex < 0 || monthIndex > 11) continue;
    byMonth.set(monthIndex, (byMonth.get(monthIndex) ?? 0) + Number(row.paid ?? 0));
  }

  const currentMonth = asOf.getMonth();
  const byMonthList: YtdMonthPayment[] = [];
  for (let i = 0; i <= currentMonth; i += 1) {
    const total = byMonth.get(i) ?? 0;
    if (total <= 0) continue;
    byMonthList.push({
      key: String(i),
      label: MONTH_SHORT[i],
      total,
    });
  }

  const ytdTotal = [...byMonth.values()].reduce((s, v) => s + v, 0);

  return { year, total: ytdTotal, byMonth: byMonthList };
}

export async function fetchDashboardSnapshot(
  supabase: SupabaseClient,
): Promise<DashboardSnapshot> {
  const [monthly, ytdPayments] = await Promise.all([
    fetchMonthlyActivity(supabase),
    fetchYtdPayments(supabase),
  ]);

  const [
    { data: openActiveCases },
    { data: unbilledCharges },
    { data: outstandingCharges },
  ] = await Promise.all([
    supabase
      .from("cases")
      .select("patient_id")
      .in("status", ["open", "active"]),
    supabase.from("charges").select("id, fee, case_id").eq("status", "unbilled"),
    supabase
      .from("charges")
      .select("id, balance, status")
      .in("status", ["billed", "partial"])
      .gt("balance", 0)
      .limit(1000),
  ]);

  const patientIds = new Set(
    (openActiveCases ?? []).map((row) => row.patient_id).filter(Boolean),
  );

  const unbilled = unbilledCharges ?? [];
  const unbilledTotal = unbilled.reduce((s, row) => s + Number(row.fee ?? 0), 0);

  const outstanding = outstandingCharges ?? [];
  const awaitingBalance = outstanding.reduce(
    (s, row) => s + Number(row.balance ?? 0),
    0,
  );

  let activePatientsTreating = 0;
  if (patientIds.size > 0) {
    const { data: realPatients } = await supabase
      .from("patients")
      .select("id")
      .or(portalPlaceholderPatientFilter())
      .in("id", [...patientIds]);
    activePatientsTreating = realPatients?.length ?? 0;
  }

  return {
    activePatientsTreating,
    openActiveCases: openActiveCases?.length ?? 0,
    unbilledChargeCount: unbilled.length,
    unbilledChargeTotal: unbilledTotal,
    billedAwaitingPaymentCount: outstanding.length,
    billedAwaitingPaymentBalance: awaitingBalance,
    monthly,
    ytdPayments,
  };
}
