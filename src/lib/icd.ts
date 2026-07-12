/** Extract ICD-10-looking codes from an array or free text (NP notes). */
export function parseIcdCodes(value: unknown): string[] {
  const out: string[] = [];
  const push = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (/^[A-TV-Z][0-9][0-9A-Z](\.?[0-9A-Z]{1,4})?$/.test(code) && !out.includes(code)) {
      out.push(code);
    }
  };

  if (Array.isArray(value)) {
    for (const v of value) if (typeof v === "string") push(v);
    return out;
  }
  if (typeof value === "string") {
    for (const token of value.split(/[\s,;/]+/)) push(token);
  }
  return out;
}
