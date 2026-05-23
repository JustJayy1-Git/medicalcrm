import type { FormPayload } from "./form-persistence";
import { PORTAL_FORM_ORDER, type FormSlug } from "./form-slugs";
import { getFormBySlug } from "./forms-registry.server";

function esc(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const s = String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isSignatureDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

function renderField(name: string, value: unknown): string {
  if (isSignatureDataUrl(value)) {
    return `<div class="sig"><img src="${value}" alt="${esc(name)} signature" /></div>`;
  }
  if (Array.isArray(value)) {
    return esc(value.length ? value.join(", ") : null);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return esc(value);
}

/** Build a printable HTML document from all portal intake forms. */
export function compileIntakePacketHtml(opts: {
  packetId: number;
  patientName: string;
  completedAt: string;
  forms: Partial<Record<FormSlug, FormPayload>>;
}): string {
  const sections = PORTAL_FORM_ORDER.map((slug) => {
    const def = getFormBySlug(slug);
    const data = opts.forms[slug] ?? {};
    const rows = def.fieldNames
      .filter((name) => {
        const v = data[name];
        return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
      })
      .map(
        (name) =>
          `<tr><th>${esc(name.replace(/_/g, " "))}</th><td>${renderField(name, data[name])}</td></tr>`,
      )
      .join("");

    return `
      <section>
        <h2>${esc(def.title)}</h2>
        <table>${rows || "<tr><td colspan=\"2\">No data recorded.</td></tr>"}</table>
      </section>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Intake Packet #${opts.packetId} — ${esc(opts.patientName)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 32px; color: #111; line-height: 1.45; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
    h2 {
      font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em;
      margin: 28px 0 8px; padding-bottom: 4px;
      border-bottom: 2px solid #41B6E6;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
    th { width: 34%; color: #444; font-weight: 600; text-transform: capitalize; }
    .sig img { max-width: 280px; max-height: 90px; border: 1px solid #ccc; background: #fff; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>Pro Injury — Patient Intake Packet</h1>
  <p class="meta">
    Patient: <strong>${esc(opts.patientName)}</strong><br>
    Packet #${opts.packetId} · Completed ${esc(opts.completedAt)}
  </p>
  ${sections}
</body>
</html>`;
}
