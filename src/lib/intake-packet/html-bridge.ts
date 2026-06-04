import { INTAKE_STORAGE_KEY, type FormSlug } from "./form-slugs";
import { buildPortalBridgeScript } from "./portal-bridge-script";

/** Screen-only zoom for portal / iPad (print layout unchanged). */
const KIOSK_PAGE_ZOOM = 1.32;

const HEADER_ALIGN_CSS = `
<style id="pro-injury-header-align">
@media screen {
  html.portal-kiosk .page .header {
    display: grid !important;
    grid-template-columns: 74px minmax(160px, 1fr) minmax(210px, 280px) !important;
    gap: 12px 16px !important;
    padding: 12px 24px !important;
    align-items: center !important;
  }
  html.portal-kiosk .header-logo {
    width: 74px !important;
    height: 74px !important;
    flex-shrink: 0;
  }
  html.portal-kiosk .brand-block { min-width: 0; align-self: center; }
  html.portal-kiosk .brand-block .brand {
    font-size: 24px !important;
    line-height: 1.08 !important;
    margin: 0 !important;
  }
  html.portal-kiosk .brand-block .tagline {
    font-size: 9px !important;
    letter-spacing: 0.18em !important;
    margin-top: 3px !important;
  }
  html.portal-kiosk .accent-rule {
    width: 100% !important;
    max-width: 200px !important;
    margin-top: 5px !important;
    height: 2px !important;
    border: 0 !important;
  }
  html.portal-kiosk .contact-block {
    text-align: right !important;
    font-size: 9px !important;
    line-height: 1.42 !important;
    justify-self: end;
    align-self: center;
  }
  html.portal-kiosk .contact-block .addr { margin-bottom: 3px !important; }
}
</style>`;

const FILLABLE_FIELD_CSS = `
<style id="pro-injury-fillable-fields">
@media screen {
  html.portal-kiosk .field input[type=text],
  html.portal-kiosk .field input[type=email],
  html.portal-kiosk .field input[type=tel],
  html.portal-kiosk .field input[type=number],
  html.portal-kiosk .field input[type=time],
  html.portal-kiosk .field input[type=date],
  html.portal-kiosk .field textarea,
  html.portal-kiosk .meta-cell input,
  html.portal-kiosk .meta-cell select,
  html.portal-kiosk .footer .initials input {
    background: rgba(65, 182, 230, 0.1) !important;
    box-shadow: inset 0 1px 4px rgba(65, 182, 230, 0.12), 0 0 0 1px rgba(65, 182, 230, 0.28) !important;
    border-radius: 3px !important;
    border-bottom-color: rgba(65, 182, 230, 0.55) !important;
  }
  html.portal-kiosk .field input:focus,
  html.portal-kiosk .field textarea:focus,
  html.portal-kiosk .meta-cell input:focus,
  html.portal-kiosk .meta-cell select:focus,
  html.portal-kiosk .footer .initials input:focus {
    background: rgba(65, 182, 230, 0.16) !important;
    box-shadow: inset 0 1px 6px rgba(65, 182, 230, 0.18), 0 0 0 2px rgba(219, 62, 177, 0.35) !important;
    outline: none !important;
  }
  html.portal-kiosk .pro-signature-pad {
    margin-top: 4px;
  }
  html.portal-kiosk .pro-signature-pad canvas {
    display: block;
    width: 100%;
    height: 88px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: inset 0 1px 6px rgba(65, 182, 230, 0.15), 0 0 0 1px rgba(65, 182, 230, 0.35);
    border-radius: 4px;
    touch-action: none;
    cursor: crosshair;
  }
  html.portal-kiosk .pro-signature-pad .pro-sig-hint {
    font-size: 9px;
    color: #555;
    margin-top: 3px;
    letter-spacing: 0.04em;
  }
  html.portal-kiosk .pro-signature-pad .pro-sig-clear {
    margin-top: 4px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid rgba(65, 182, 230, 0.45);
    background: rgba(65, 182, 230, 0.08);
    color: #0c0f15;
    cursor: pointer;
  }
  /* Signature row: Name | Date | Signature (signature last, aligned on baseline) */
  html.portal-kiosk .sig-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr) minmax(0, 1.5fr) !important;
    align-items: end !important;
    gap: 10px !important;
  }
  html.portal-kiosk .sig-row.three-equal {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  html.portal-kiosk .sig-cell {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  html.portal-kiosk .sig-cell.signature {
    align-self: end;
  }
  html.portal-kiosk .sig-cell.signature .pro-signature-pad {
    margin-top: 3px;
    width: 100%;
  }
  html.portal-kiosk .sig-cell.signature .pro-signature-pad canvas {
    height: 52px !important;
    min-height: 52px !important;
  }
  html.portal-kiosk .sig-cell.signature .pro-sig-hint,
  html.portal-kiosk .sig-cell.signature .pro-sig-clear {
    display: none;
  }
  html.portal-kiosk .pro-field-missing,
  html.portal-kiosk .pro-signature-pad.pro-field-missing canvas {
    box-shadow: 0 0 0 2px #DB3EB1, inset 0 0 0 2px rgba(219, 62, 177, 0.25) !important;
    background: rgba(219, 62, 177, 0.08) !important;
  }
  html.portal-kiosk .pro-intake-validation-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    background: #7f1d3a;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    padding: 10px 16px;
    display: none;
  }
  html.portal-kiosk .pro-sig-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    background: rgba(12, 15, 21, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  html.portal-kiosk .pro-sig-modal-panel {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    max-width: 96vw;
    width: 720px;
    box-shadow: 0 24px 48px rgba(0,0,0,0.35);
  }
  html.portal-kiosk .pro-sig-modal-title {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 10px;
    text-align: center;
  }
  html.portal-kiosk .pro-sig-modal-panel canvas {
    width: 100%;
    height: 280px;
    border: 2px solid #41B6E6;
    border-radius: 8px;
    touch-action: none;
    cursor: crosshair;
  }
  html.portal-kiosk .pro-sig-modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 12px;
  }
  html.portal-kiosk .pro-sig-modal-clear {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #94a3b8;
    background: #f8fafc;
    font-weight: 600;
    cursor: pointer;
  }
  html.portal-kiosk .pro-sig-modal-done {
    padding: 10px 20px;
    border-radius: 8px;
    border: 0;
    background: linear-gradient(135deg, #41B6E6, #DB3EB1);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
  }
  html.portal-kiosk textarea[name="inj_initial"] {
    min-height: 88px !important;
    resize: vertical;
  }
}
</style>`;

const KIOSK_DISPLAY_CSS = `
<style id="pro-injury-kiosk-display">
@media screen {
  html.portal-kiosk {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }
  html.portal-kiosk body {
    overflow-x: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  html.portal-kiosk .page {
    zoom: ${KIOSK_PAGE_ZOOM};
    font-size: 12px !important;
    line-height: 1.35 !important;
    margin: 12px auto 28px !important;
  }
  html.portal-kiosk .meta-cell .lbl,
  html.portal-kiosk .field label.lbl {
    font-size: 9px !important;
  }
  html.portal-kiosk .section-title {
    font-size: 13px !important;
  }
  html.portal-kiosk .page-title h1 {
    font-size: 17px !important;
  }
  html.portal-kiosk .field input[type=date],
  html.portal-kiosk .meta-cell input[type=date] {
    min-height: 36px !important;
    cursor: pointer;
  }
  html.portal-kiosk .meta-cell select {
    min-height: 32px !important;
    font-size: 13px !important;
    cursor: pointer;
  }
  html.portal-kiosk .field input[type=text],
  html.portal-kiosk .field input[type=email],
  html.portal-kiosk .field input[type=tel],
  html.portal-kiosk .field input[type=date],
  html.portal-kiosk .field input[type=number],
  html.portal-kiosk .field input[type=time],
  html.portal-kiosk .field textarea,
  html.portal-kiosk .meta-cell input {
    min-height: 28px !important;
    height: auto !important;
    font-size: 13px !important;
  }
  html.portal-kiosk .pill {
    font-size: 11px !important;
    padding: 5px 12px !important;
  }
  html.portal-kiosk .toolbar {
    zoom: 1;
    font-size: 14px;
  }
  html.portal-kiosk .toolbar .btn {
    font-size: 13px !important;
    padding: 10px 16px !important;
  }
  html.portal-kiosk .page-link {
    font-size: 12px !important;
    padding: 8px 14px !important;
  }
}
@media print {
  html.portal-kiosk .page {
    zoom: 1 !important;
    font-size: 10px !important;
  }
}
</style>`;

const PORTAL_PAGER: [FormSlug, string][] = [
  ["intake", "01 Intake"],
  ["aob", "02 AOB"],
  ["hipaa", "03 HIPAA"],
  ["fraud", "04 Fraud"],
  ["financial", "05 Financial"],
  ["treatment", "06 Treatment"],
  ["records", "07 Records"],
];

const FULL_PAGER: [FormSlug, string][] = [
  ["intake", "01 Intake"],
  ["disclosure", "02 PIP Disclosure"],
  ["aob", "03 AOB"],
  ["hipaa", "04 HIPAA"],
  ["fraud", "05 Fraud"],
  ["financial", "06 Financial"],
  ["treatment", "07 Treatment"],
  ["records", "08 Records"],
];

function patchPagerAndPageCounts(
  html: string,
  activeSlug: FormSlug,
  portalMode: boolean,
): string {
  const pages = portalMode ? PORTAL_PAGER : FULL_PAGER;
  const total = pages.length;
  const pageIndex = pages.findIndex(([slug]) => slug === activeSlug);
  const pageNum = pageIndex >= 0 ? pageIndex + 1 : 1;
  const pageStr = String(pageNum).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  const pagerLinks = pages
    .map(([slug, label]) => {
      const cls = slug === activeSlug ? "page-link active" : "page-link";
      const arrow = slug === "records" ? " →" : "";
      return `<a class="${cls}" href="${slug}.html">${label}${arrow}</a>`;
    })
    .join("");

  let out = html.replace(/<div class="pager">[\s\S]*?<\/div>/, `<div class="pager">${pagerLinks}</div>`);
  out = out.replace(/Page \d{2} of \d{2}/g, `Page ${pageStr} of ${totalStr}`);
  out = out.replace(
    /<span class="badge">\d{2}<span class="of"> \/ \d{2}<\/span><\/span>/,
    `<span class="badge">${pageStr}<span class="of"> / ${totalStr}</span></span>`,
  );
  return out;
}

function injectKioskDisplay(html: string): string {
  let out = html.replace(/<html(\s[^>]*)?>/i, (match) => {
    if (/class=/i.test(match)) {
      return match.replace(/class=(["'])([^"']*)\1/i, (_, q, classes) => {
        if (classes.includes("portal-kiosk")) return match;
        return `class=${q}${classes} portal-kiosk${q}`;
      });
    }
    return match.replace("<html", '<html class="portal-kiosk"');
  });
  out = out.replace("</head>", `${HEADER_ALIGN_CSS}\n${FILLABLE_FIELD_CSS}\n${KIOSK_DISPLAY_CSS}\n</head>`);
  return out;
}

/** Patches vanilla HTML form scripts to use CRM API instead of localStorage. */
export function injectApiBridge(
  html: string,
  opts: {
    packetId: string;
    formSlug: FormSlug;
    storeKey: string;
    needsIntakePrefill: boolean;
    portalMode?: boolean;
  },
): string {
  let patched = patchPagerAndPageCounts(html, opts.formSlug, opts.portalMode ?? true);
  const portalNavSlugs =
    opts.portalMode !== false ? PORTAL_PAGER.map(([slug]) => slug) : null;

  const bridge = buildPortalBridgeScript({
    packetId: opts.packetId,
    formSlug: opts.formSlug,
    needsIntakePrefill: opts.needsIntakePrefill,
    portalNavSlugs,
  });

  let out = patched.replace("</head>", `${bridge}\n</head>`);

  // Disable legacy localStorage-only listeners (hijack script handles persistence).
  out = out.replace(
    /form\.addEventListener\(['"]input['"],\s*debounceSave\);\s*form\.addEventListener\(['"]change['"],\s*debounceSave\);\s*load\(\);/g,
    "/* persistence: pro-injury hijack */",
  );

  out = out.replace(
    /indicator\.textContent = '●  saved locally'/g,
    "indicator.textContent = '●  saved'",
  );

  return injectKioskDisplay(out);
}
