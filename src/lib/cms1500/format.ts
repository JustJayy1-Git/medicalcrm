import { splitIsoDate } from "@/lib/date";

export function formatPatientName(p: {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
}) {
  const mid = p.middle_name?.trim() ? ` ${p.middle_name.trim()}` : "";
  const suf = p.suffix?.trim() ? ` ${p.suffix.trim()}` : "";
  return `${p.last_name}, ${p.first_name}${mid}${suf}`;
}

export function formatAddress(row: {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}) {
  const street = [row.address_line1, row.address_line2]
    .filter(Boolean)
    .join(", ");
  return {
    street,
    city: row.city?.trim() ?? "",
    state: row.state?.trim() ?? "",
    zip: row.zip?.trim() ?? "",
    full: [street, row.city, row.state, row.zip].filter(Boolean).join(" "),
  };
}

export function buildDiagnosisIndex(codes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of codes) {
    const code = raw?.trim().toUpperCase();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
    if (out.length >= 12) break;
  }
  return out;
}

export function diagnosisPointers(
  lineIcds: string[] | null | undefined,
  index: string[],
): string {
  if (!lineIcds?.length || !index.length) return "A";
  const letters = "ABCDEFGHIJKL";
  const ptrs: string[] = [];
  for (const raw of lineIcds) {
    const code = raw?.trim().toUpperCase();
    if (!code) continue;
    const i = index.indexOf(code);
    if (i >= 0 && i < letters.length) ptrs.push(letters[i]);
  }
  return ptrs.length ? [...new Set(ptrs)].join("") : "A";
}

export { splitIsoDate };
