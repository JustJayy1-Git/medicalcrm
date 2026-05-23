import { INTAKE_STORAGE_KEY } from "./form-slugs";

/** Screen-only zoom for portal / iPad (print layout unchanged). */
const KIOSK_PAGE_ZOOM = 1.32;

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
  out = out.replace("</head>", `${KIOSK_DISPLAY_CSS}\n</head>`);
  return out;
}

/** Patches vanilla HTML form scripts to use CRM API instead of localStorage. */
export function injectApiBridge(
  html: string,
  opts: { packetId: string; formSlug: string; storeKey: string; needsIntakePrefill: boolean },
): string {
  const bridge = `
<script id="pro-injury-api-bridge">
(function(){
  const PACKET_ID = ${JSON.stringify(opts.packetId)};
  const FORM_SLUG = ${JSON.stringify(opts.formSlug)};
  const STORE_KEY = ${JSON.stringify(opts.storeKey)};
  const INTAKE_KEY = ${JSON.stringify(INTAKE_STORAGE_KEY)};
  const API_URL = '/api/intake-packets/' + PACKET_ID + '/' + FORM_SLUG;

  async function apiGet(url){
    const r = await fetch(url, { credentials: 'same-origin' });
    if(!r.ok) throw new Error('load failed');
    return r.json();
  }

  window.__proInjuryApiSave = async function(data){
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });
    if(!r.ok) throw new Error('save failed');
    return r.json();
  };

  window.__proInjuryBridge = {
    ready: false,
    async preload(){
      try {
        const packet = await apiGet('/api/intake-packets/' + PACKET_ID);
        const cached = packet.forms && packet.forms[FORM_SLUG] ? packet.forms[FORM_SLUG] : {};
        const intake = packet.forms && packet.forms.intake ? packet.forms.intake : {};
        localStorage.setItem(INTAKE_KEY, JSON.stringify(intake));
        this._cachedForm = cached;
        this.ready = true;
      } catch(e) {
        console.error(e);
        this.ready = true;
      }
    },
    getCachedForm(){ return this._cachedForm || {}; }
  };

  function wirePager(){
    document.querySelectorAll('a.page-link[href$=".html"]').forEach(function(a){
      var slug = a.getAttribute('href').replace('.html','');
      a.addEventListener('click', function(e){
        e.preventDefault();
        if(window.parent !== window){
          window.parent.postMessage({ type: 'pro-injury-nav', slug: slug }, '*');
        } else {
          location.href = '/portal/packet/' + PACKET_ID + '/forms/' + slug;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', wirePager);
})();
</script>`;

  let out = html.replace("</head>", `${bridge}\n</head>`);

  out = out.replace(
    /function save\(\)\{[\s\S]*?\n  \}/,
    `function save(){
    try {
      window.__proInjuryApiSave(collect()).then(() => setIndicator('saved')).catch(() => setIndicator('unsaved'));
    } catch(e){ console.error(e); }
  }`,
  );

  out = out.replace(
    /function load\(\)\{[\s\S]*?\n  \}/,
    opts.needsIntakePrefill
      ? `async function load(){
    try {
      await window.__proInjuryBridge.preload();
      const cached = window.__proInjuryBridge.getCachedForm();
      if(cached && Object.keys(cached).length){ apply(cached); setIndicator('saved'); }
      const intake = JSON.parse(localStorage.getItem(INTAKE_KEY) || '{}');
      const map = {
        patient_name: intake.patient_name,
        patient_dob: intake.dob,
        patient_phone: intake.phone_cell,
        patient_email: intake.email,
        date_of_accident: intake.meta_date_of_accident,
        meta_todays_date: intake.meta_todays_date,
        meta_date_of_accident: intake.meta_date_of_accident,
        meta_referred_by: intake.meta_referred_by,
        meta_type_of_accident: intake.meta_type_of_accident,
        patient_name_print: intake.patient_name,
        insured_name_print: intake.patient_name,
        financial_name_print: intake.patient_name,
        records_name_print: intake.patient_name
      };
      for(const k in map){
        if(!map[k]) continue;
        form.querySelectorAll('[name="'+k+'"]').forEach(function(el){
          if(el.type === 'radio' || el.type === 'checkbox') return;
          if(!el.value) el.value = map[k];
        });
      }
    } catch(e){ console.error(e); }
  }`
      : `async function load(){
    try {
      await window.__proInjuryBridge.preload();
      const cached = window.__proInjuryBridge.getCachedForm();
      if(cached && Object.keys(cached).length){ apply(cached); setIndicator('saved'); }
    } catch(e){ console.error(e); }
  }`,
  );

  out = out.replace(
    /localStorage\.removeItem\(STORE_KEY\)/g,
    "window.__proInjuryApiSave({}).then(() => {}).catch(() => {})",
  );

  out = out.replace(
    /indicator\.textContent = '●  saved locally'/g,
    "indicator.textContent = '●  saved'",
  );

  return injectKioskDisplay(out);
}
