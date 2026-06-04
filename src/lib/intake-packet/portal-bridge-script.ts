import { INTAKE_STORAGE_KEY, type FormSlug } from "./form-slugs";

export function buildPortalBridgeScript(opts: {
  packetId: string;
  formSlug: FormSlug;
  needsIntakePrefill: boolean;
  portalNavSlugs: string[] | null;
}): string {
  return `
<script id="pro-injury-api-bridge">
(function(){
  const PACKET_ID = ${JSON.stringify(opts.packetId)};
  const FORM_SLUG = ${JSON.stringify(opts.formSlug)};
  const INTAKE_KEY = ${JSON.stringify(INTAKE_STORAGE_KEY)};
  const API_URL = '/api/intake-packets/' + PACKET_ID + '/' + FORM_SLUG;
  const NEEDS_INTAKE_PREFILL = ${opts.needsIntakePrefill ? "true" : "false"};
  const PORTAL_NAV_ONLY = ${opts.portalNavSlugs ? JSON.stringify(opts.portalNavSlugs) : "null"};

  const NAME_PRINT_FIELDS = ['patient_name_print','financial_name_print','fraud_name_print','treatment_name_print','records_name_print','insured_name_print','provider_name_print'];
  const DATE_SIG_FIELDS = ['patient_signed_date','financial_signed_date','fraud_signed_date','treatment_signed_date','records_signed_date','insured_signed_date','provider_signed_date'];

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
    var name = intake.patient_name || '';
    var dob = intake.dob || '';
    var today = intake.meta_todays_date || '';
    var accident = intake.meta_date_of_accident || '';
    var cell = intake.phone_cell || '';
    var home = intake.phone_home || '';
    var map = {
      patient_name: name,
      patient_dob: dob,
      dob: dob,
      patient_phone: cell,
      phone_cell: cell,
      phone_home: home,
      patient_email: intake.email || '',
      email: intake.email || '',
      date_of_accident: accident,
      meta_todays_date: today,
      meta_date_of_accident: accident,
      meta_referred_by: intake.meta_referred_by || '',
      meta_type_of_accident: intake.meta_type_of_accident || ''
    };
    NAME_PRINT_FIELDS.forEach(function(f){ map[f] = name; });
    DATE_SIG_FIELDS.forEach(function(f){
      if(today) map[f] = today;
    });
    return map;
  }

  function applyIntakePrefill(intake, form){
    if(!intake || !form) return;
    var map = intakePrefillMap(intake);
    for(var k in map){
      if(!map[k]) continue;
      form.querySelectorAll('[name="'+k+'"]').forEach(function(el){
        if(el.type === 'radio' || el.type === 'checkbox') return;
        el.value = map[k];
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

  function normalizeSigRows(){
    document.querySelectorAll('.sig-row').forEach(function(row){
      var cells = Array.from(row.querySelectorAll(':scope > .sig-cell'));
      if(cells.length < 2) return;
      var sigCell = cells.find(function(c){ return c.classList.contains('signature'); });
      if(!sigCell) return;
      var dateCell = cells.find(function(c){
        return c !== sigCell && c.querySelector('input[type=date]');
      });
      var nameCells = cells.filter(function(c){
        return c !== sigCell && c !== dateCell;
      });
      nameCells.forEach(function(c){ row.appendChild(c); });
      if(dateCell) row.appendChild(dateCell);
      row.appendChild(sigCell);
    });
  }

  function openSignatureModal(input, previewCanvas, previewCtx){
    if(document.getElementById('pro-sig-modal')) return;
    var overlay = document.createElement('div');
    overlay.id = 'pro-sig-modal';
    overlay.className = 'pro-sig-modal-overlay';
    var panel = document.createElement('div');
    panel.className = 'pro-sig-modal-panel';
    var title = document.createElement('p');
    title.className = 'pro-sig-modal-title';
    title.textContent = 'Sign here — use finger or Apple Pencil';
    var big = document.createElement('canvas');
    big.width = 900;
    big.height = 320;
    var bctx = big.getContext('2d');
    var drawing = false;
    var last = null;
    function bpos(ev){
      var r = big.getBoundingClientRect();
      var cx = ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : 0);
      var cy = ev.clientY !== undefined ? ev.clientY : (ev.touches && ev.touches[0] ? ev.touches[0].clientY : 0);
      return { x: (cx - r.left) * (big.width / r.width), y: (cy - r.top) * (big.height / r.height) };
    }
    function bstart(ev){ ev.preventDefault(); drawing = true; last = bpos(ev); }
    function bmove(ev){
      if(!drawing || !last) return;
      ev.preventDefault();
      var p = bpos(ev);
      bctx.strokeStyle = '#111';
      bctx.lineWidth = 3;
      bctx.lineCap = 'round';
      bctx.lineJoin = 'round';
      bctx.beginPath();
      bctx.moveTo(last.x, last.y);
      bctx.lineTo(p.x, p.y);
      bctx.stroke();
      last = p;
    }
    function bend(){ drawing = false; last = null; }
    big.addEventListener('pointerdown', bstart);
    big.addEventListener('pointermove', bmove);
    big.addEventListener('pointerup', bend);
    big.addEventListener('pointerleave', bend);
    big.addEventListener('pointercancel', bend);
    if(input.value && String(input.value).indexOf('data:image') === 0){
      var img = new Image();
      img.onload = function(){ bctx.drawImage(img, 0, 0, big.width, big.height); };
      img.src = input.value;
    }
    var actions = document.createElement('div');
    actions.className = 'pro-sig-modal-actions';
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'pro-sig-modal-clear';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', function(){
      bctx.clearRect(0, 0, big.width, big.height);
    });
    var doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.className = 'pro-sig-modal-done';
    doneBtn.textContent = 'Done';
    doneBtn.addEventListener('click', function(){
      var dataUrl = big.toDataURL('image/png');
      input.value = dataUrl;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.drawImage(big, 0, 0, previewCanvas.width, previewCanvas.height);
      overlay.remove();
    });
    actions.appendChild(clearBtn);
    actions.appendChild(doneBtn);
    panel.appendChild(title);
    panel.appendChild(big);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    overlay.addEventListener('click', function(e){ if(e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

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
      canvas.addEventListener('click', function(){ openSignatureModal(input, canvas, ctx); });
      canvas.addEventListener('pointerdown', function(ev){
        ev.preventDefault();
        openSignatureModal(input, canvas, ctx);
      });
      if(input.value && String(input.value).indexOf('data:image') === 0){
        var img = new Image();
        img.onload = function(){ ctx.drawImage(img, 0, 0, canvas.width, canvas.height); };
        img.src = input.value;
      }
      var hint = document.createElement('div');
      hint.className = 'pro-sig-hint';
      hint.textContent = 'Tap to sign (opens larger)';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(canvas);
      wrap.appendChild(hint);
    });
  }

  function wireAttorneyBill(form){
    if(FORM_SLUG !== 'financial') return;
    function syncAttorneyFromIntake(){
      var intake = window.__proInjuryBridge.intake || {};
      var bill = form.querySelector('input[name="deductible_choice"][value="bill_attorney"]');
      if(!bill || !bill.checked) return;
      ['attorney_firm','attorney_name','attorney_phone'].forEach(function(n){
        var el = form.querySelector('[name="'+n+'"]');
        if(el && intake[n]) el.value = intake[n];
      });
    }
    form.addEventListener('change', function(e){
      if(e.target && e.target.name === 'deductible_choice') syncAttorneyFromIntake();
    });
    syncAttorneyFromIntake();
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

  window.__proInjuryHighlightFields = function(fieldNames){
    document.querySelectorAll('.pro-field-missing').forEach(function(el){
      el.classList.remove('pro-field-missing');
    });
    (fieldNames || []).forEach(function(name){
      document.querySelectorAll('[name="'+name+'"]').forEach(function(el){
        el.classList.add('pro-field-missing');
        var pad = el.closest('.pro-signature-pad');
        if(pad) pad.classList.add('pro-field-missing');
      });
    });
    var banner = document.getElementById('proIntakeValidationBanner');
    if(!banner){
      banner = document.createElement('div');
      banner.id = 'proIntakeValidationBanner';
      banner.className = 'pro-intake-validation-banner';
      document.body.insertBefore(banner, document.body.firstChild);
    }
    banner.textContent = 'Please complete required fields highlighted in red (signature, date, and name) before submitting.';
    banner.style.display = 'block';
  };

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
        var payload = collect();
        await window.__proInjuryApiSave(payload);
        if(FORM_SLUG === 'intake'){
          window.__proInjuryBridge.intake = payload;
          try { localStorage.setItem(INTAKE_KEY, JSON.stringify(payload)); } catch(e){}
        }
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
        if(NEEDS_INTAKE_PREFILL || FORM_SLUG === 'intake') applyIntakePrefill(intake, form);
        normalizeSigRows();
        initSignaturePads();
        wireAttorneyBill(form);
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

    if(FORM_SLUG === 'intake'){
      form.addEventListener('input', function(){
        window.__proInjuryBridge.intake = collect();
      }, true);
      form.addEventListener('change', function(){
        window.__proInjuryBridge.intake = collect();
      }, true);
    }

    loadNow();
  }

  window.addEventListener('message', function(e){
    if(e.data && e.data.type === 'pro-injury-flush-save'){
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
      return;
    }
    if(e.data && e.data.type === 'pro-injury-highlight' && FORM_SLUG === e.data.slug){
      window.__proInjuryHighlightFields(e.data.fields || []);
    }
  });

  document.addEventListener('DOMContentLoaded', function(){
    wirePager();
    normalizeSigRows();
    hijackPersistence();
    setTimeout(function(){
      normalizeSigRows();
      initSignaturePads();
    }, 300);
  });
})();
</script>`;
}
