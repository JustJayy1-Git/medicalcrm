/** Format ISO date (YYYY-MM-DD) like Medisoft M/D/YYYY. */
export function fmtDos(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(m)}/${Number(d)}/${y}`;
}

export function splitIcdCodes(codes?: string[] | null): [string, string, string, string] {
  const list = codes ?? [];
  return [list[0] ?? "", list[1] ?? "", list[2] ?? "", list[3] ?? ""];
}

export function joinIcdCodes(
  d1: string,
  d2: string,
  d3: string,
  d4: string,
): string[] {
  return [d1, d2, d3, d4].map((s) => s.trim()).filter(Boolean);
}
