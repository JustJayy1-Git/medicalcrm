import { INTAKE_STORAGE_KEY } from "./forms-registry";

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
  let cacheForm = null;
  let cacheIntake = null;

  async function apiGet(url){
    const r = await fetch(url, { credentials: 'same-origin' });
    if(!r.ok) throw new Error('load failed');
    return r.json();
  }
  async function apiSave(data){
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });
    if(!r.ok) throw new Error('save failed');
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
        cacheForm = packet.forms && packet.forms[FORM_SLUG] ? packet.forms[FORM_SLUG] : {};
        const intake = packet.forms && packet.forms.intake ? packet.forms.intake : {};
        cacheIntake = intake;
        localStorage.setItem(INTAKE_KEY, JSON.stringify(intake));
        this.ready = true;
      } catch(e) {
        console.error(e);
        this.ready = true;
      }
    },
    getCachedForm(){ return cacheForm; },
    getCachedIntake(){ return cacheIntake; }
  };
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
        date_of_accident: intake.meta_date_of_accident
      };
      for(const k in map){
        const el = form.querySelector('[name='+k+']');
        if(el && !el.value && map[k]) el.value = map[k];
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

  out = out.replace(/\n  load\(\);\n/g, "\n  load();\n");

  return out;
}
