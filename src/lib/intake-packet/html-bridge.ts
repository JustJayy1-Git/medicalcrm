import { INTAKE_STORAGE_KEY, type FormSlug } from "./form-slugs";

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

  const bridge = `
<script id="pro-injury-api-bridge">
(function(){
  const PACKET_ID = ${JSON.stringify(opts.packetId)};
  const FORM_SLUG = ${JSON.stringify(opts.formSlug)};
  const INTAKE_KEY = ${JSON.stringify(INTAKE_STORAGE_KEY)};
  const API_URL = '/api/intake-packets/' + PACKET_ID + '/' + FORM_SLUG;
  const NEEDS_INTAKE_PREFILL = ${opts.needsIntakePrefill ? "true" : "false"};
  const PORTAL_NAV_ONLY = ${portalNavSlugs ? JSON.stringify(portalNavSlugs) : "null"};

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

  function intakePrefillMap(intake){
    return {
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
  }

  function applyIntakePrefill(intake, form){
    if(!intake || !form) return;
    const map = intakePrefillMap(intake);
    for(const k in map){
      if(!map[k]) continue;
      form.querySelectorAll('[name="'+k+'"]').forEach(function(el){
        if(el.type === 'radio' || el.type === 'checkbox') return;
        if(!el.value) el.value = map[k];
      });
    }
  }

  window.__proInjuryBridge = {
    ready: false,
    intake: {},
    async preload(){
      try {
        const packet = await apiGet('/api/intake-packets/' + PACKET_ID);
        const cached = packet.forms && packet.forms[FORM_SLUG] ? packet.forms[FORM_SLUG] : {};
        const intake = packet.forms && packet.forms.intake ? packet.forms.intake : {};
        this.intake = intake;
        try { localStorage.setItem(INTAKE_KEY, JSON.stringify(intake)); } catch(e){}
        this._cachedForm = cached;
        this.ready = true;
        return { cached, intake };
      } catch(e) {
        console.error(e);
        this.ready = true;
        return { cached: {}, intake: {} };
      }
    },
    getCachedForm(){ return this._cachedForm || {}; }
  };

  function initSignaturePads(){
    var sigInputs = document.querySelectorAll('.sig-cell.signature input[type=text], input[name$="_signature"]');
    sigInputs.forEach(function(input){
      if(input.dataset.sigPad === '1') return;
      input.dataset.sigPad = '1';
      input.type = 'hidden';
      var wrap = document.createElement('div');
      wrap.className = 'pro-signature-pad';
      var canvas = document.createElement('canvas');
      canvas.width = 520;
      canvas.height = 120;
      var ctx = canvas.getContext('2d');
      var drawing = false;
      var last = null;
      function pos(ev){
        var r = canvas.getBoundingClientRect();
        var cx = ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : 0);
        var cy = ev.clientY !== undefined ? ev.clientY : (ev.touches && ev.touches[0] ? ev.touches[0].clientY : 0);
        return { x: (cx - r.left) * (canvas.width / r.width), y: (cy - r.top) * (canvas.height / r.height) };
      }
      function paint(){
        input.value = canvas.toDataURL('image/png');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      function start(ev){ ev.preventDefault(); drawing = true; last = pos(ev); }
      function move(ev){
        if(!drawing || !last) return;
        ev.preventDefault();
        var p = pos(ev);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last = p;
        paint();
      }
      function end(){ drawing = false; last = null; }
      canvas.addEventListener('pointerdown', start);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', end);
      canvas.addEventListener('pointerleave', end);
      canvas.addEventListener('pointercancel', end);
      var hint = document.createElement('div');
      hint.className = 'pro-sig-hint';
      hint.textContent = 'Sign with finger or Apple Pencil';
      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'pro-sig-clear';
      clearBtn.textContent = 'Clear signature';
      clearBtn.addEventListener('click', function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      if(input.value && String(input.value).indexOf('data:image') === 0){
        var img = new Image();
        img.onload = function(){ ctx.drawImage(img, 0, 0, canvas.width, canvas.height); };
        img.src = input.value;
      }
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(canvas);
      wrap.appendChild(hint);
      wrap.appendChild(clearBtn);
    });
  }

  function wirePager(){
    document.querySelectorAll('a.page-link[href$=".html"]').forEach(function(a){
      var slug = a.getAttribute('href').replace('.html','');
      if(PORTAL_NAV_ONLY && PORTAL_NAV_ONLY.indexOf(slug) === -1) return;
      a.addEventListener('click', function(e){
        e.preventDefault();
        var nav = function(){ 
          if(window.parent !== window){
            window.parent.postMessage({ type: 'pro-injury-nav', slug: slug }, '*');
          } else {
            location.href = '/portal/packet/' + PACKET_ID + '/forms/' + slug;
          }
        };
        if(typeof window.__proInjuryFlushSave === 'function'){
          window.__proInjuryFlushSave().finally(nav);
        } else {
          nav();
        }
      });
    });
  }

  function hijackPersistence(){
    var form = document.querySelector('form');
    if(!form || form.dataset.proInjuryHijacked === '1') return;
    form.dataset.proInjuryHijacked = '1';

    var indicator = document.getElementById('savedIndicator');
    var saveTimer = null;

    function setIndicator(state){
      if(!indicator) return;
      if(state==='saving'){ indicator.textContent = '●  saving…'; indicator.style.color = '#41B6E6'; }
      else if(state==='saved'){ indicator.textContent = '●  saved'; indicator.style.color = '#7fdf7f'; }
      else { indicator.textContent = '●  unsaved'; indicator.style.color = '#c8d2e0'; }
    }

    function collect(){
      var data = {};
      form.querySelectorAll('[name]').forEach(function(el){
        var name = el.name;
        if(el.type === 'checkbox'){
          var boxes = form.querySelectorAll('[name="'+name+'"][type=checkbox]');
          if(boxes.length > 1){
            if(!(name in data)) data[name] = [];
            if(el.checked && !data[name].includes(el.value)) data[name].push(el.value);
          } else {
            data[name] = el.checked;
          }
        } else if(el.type === 'radio'){
          if(el.checked) data[name] = el.value;
          else if(!(name in data)) data[name] = '';
        } else {
          data[name] = el.value;
        }
      });
      return data;
    }

    function apply(data){
      if(!data) return;
      form.querySelectorAll('[name]').forEach(function(el){
        var v = data[el.name];
        if(v === undefined) return;
        if(el.type === 'checkbox'){
          if(Array.isArray(v)) el.checked = v.includes(el.value);
          else el.checked = !!v;
        } else if(el.type === 'radio'){
          el.checked = (v === el.value);
        } else {
          el.value = v ?? '';
        }
      });
    }

    async function saveNow(){
      setIndicator('saving');
      try {
        await window.__proInjuryApiSave(collect());
        setIndicator('saved');
        return true;
      } catch(e){
        console.error(e);
        setIndicator('unsaved');
        return false;
      }
    }

    function debounceSave(){
      setIndicator('saving');
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, 400);
    }

    async function loadNow(){
      try {
        var loaded = await window.__proInjuryBridge.preload();
        var cached = loaded.cached || {};
        var intake = loaded.intake || {};
        if(cached && Object.keys(cached).length){
          apply(cached);
          setIndicator('saved');
        }
        if(NEEDS_INTAKE_PREFILL) applyIntakePrefill(intake, form);
        initSignaturePads();
      } catch(e){
        console.error(e);
      }
    }

    window.__proInjuryFlushSave = async function(){
      clearTimeout(saveTimer);
      saveTimer = null;
      return saveNow();
    };

    window.__proInjuryCollect = collect;
    window.__proInjuryApply = apply;

    form.addEventListener('input', debounceSave, true);
    form.addEventListener('change', debounceSave, true);

    loadNow();
  }

  window.addEventListener('message', function(e){
    if(!e.data || e.data.type !== 'pro-injury-flush-save') return;
    var reply = function(ok){
      if(window.parent !== window){
        window.parent.postMessage({ type: 'pro-injury-flush-done', ok: ok, requestId: e.data.requestId }, '*');
      }
    };
    if(typeof window.__proInjuryFlushSave === 'function'){
      window.__proInjuryFlushSave().then(function(ok){ reply(!!ok); }).catch(function(){ reply(false); });
    } else {
      reply(false);
    }
  });

  document.addEventListener('DOMContentLoaded', function(){
    wirePager();
    hijackPersistence();
    setTimeout(initSignaturePads, 300);
  });
})();
</script>`;

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
