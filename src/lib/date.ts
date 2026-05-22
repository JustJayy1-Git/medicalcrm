/** ISO date YYYY-MM-DD → display for UI (stable on server). */
export function formatIsoDateDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${m}/${d}/${y}`;
}

/** Split ISO date into CMS-1500 MM / DD / YY parts. */
export function splitIsoDate(iso: string | null | undefined): {
  mm: string;
  dd: string;
  yy: string;
} {
  if (!iso) return { mm: "", dd: "", yy: "" };
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return { mm: "", dd: "", yy: "" };
  return { mm: m.padStart(2, "0"), dd: d.padStart(2, "0"), yy: y.slice(-2) };
}
