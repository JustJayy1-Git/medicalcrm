#!/usr/bin/env python3
"""Final 7-page consolidated Pro Injury intake packet builder.
Merges:
  - HIPAA Consent + Privacy Acknowledgement → page 04 (hipaa.html)
  - Financial Responsibility + Deductible → page 06 (financial.html)
  - Consent for Treatment + Radiology → page 07 (treatment.html)

Adds Spanish summaries to all English-only legal pages.
Removes old standalone consent.html, priv_ack.html, finresp.html, deductible.html, radiology.html.
"""
import os, glob

SRC = "/mnt/c/Users/Stric/MedicalCRM/design/page1.html"
DESIGN_DIR = "/mnt/c/Users/Stric/MedicalCRM/design"

with open(SRC, "r", encoding="utf-8") as f:
    src_lines = f.readlines()

WATERMARK_IMG = src_lines[245].strip()
HEADER_LOGO_IMG = src_lines[251].strip()

# Final 8-page nav (used by every page)
PAGES_FINAL = [
    ("intake.html",      "01 Intake"),
    ("disclosure.html",  "02 PIP Disclosure"),
    ("aob.html",         "03 AOB"),
    ("hipaa.html",       "04 HIPAA Consent"),
    ("fraud.html",       "05 Fraud"),
    ("financial.html",   "06 Financial"),
    ("treatment.html",   "07 Treatment"),
    ("records.html",     "08 Records"),
]
TOTAL = 8

def make_pager(active_href):
    parts = []
    for href, label in PAGES_FINAL:
        cls = "page-link active" if href == active_href else "page-link"
        parts.append(f'<a class="{cls}" href="{href}">{label}</a>')
    return f'<div class="pager">{"".join(parts)}</div>'

# ============ Shared CSS (kept identical to previous builds) ============
SHARED_CSS = r"""
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #1a1d24; }
  .toolbar {
    position: sticky; top: 0; z-index: 100;
    background: #0c0f15; color: #fff;
    padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; border-bottom: 1px solid #2a2f3a;
  }
  .toolbar .brand { font-family: "Times New Roman", serif; font-size: 16px; font-weight: 700; letter-spacing: 0.04em; }
  .toolbar .brand .accent {
    background: linear-gradient(90deg, #41B6E6 0%, #DB3EB1 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .toolbar .actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn {
    background: #fff; color: #000; border: 0; border-radius: 6px;
    padding: 8px 14px; font-size: 12px; font-weight: 700;
    letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer;
    font-family: inherit;
  }
  .btn.primary { background: linear-gradient(135deg, #41B6E6 0%, #DB3EB1 100%); color: #fff; }
  .btn.ghost { background: transparent; color: #fff; border: 1px solid #3a4150; }
  .btn:active { transform: translateY(1px); }
  .saved-indicator {
    font-size: 10.5px; opacity: 0.7; letter-spacing: 0.08em;
    text-transform: uppercase; color: #c8d2e0; margin-right: 6px;
  }
  .pager { display: flex; gap: 5px; flex-wrap: wrap; max-width: 720px; }
  .page-link {
    color: #c8d2e0; text-decoration: none;
    font-size: 10.5px; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    padding: 6px 11px; border-radius: 6px;
    border: 1px solid #2a2f3a;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .page-link:hover { background: #1a1f2a; color: #fff; border-color: #3a4150; }
  .page-link.active {
    background: linear-gradient(135deg, #41B6E6 0%, #DB3EB1 100%);
    color: #fff; border-color: transparent;
  }

  .page {
    width: 816px; min-height: 1056px;
    margin: 24px auto;
    background: #fff; color: #000;
    font-family: "Inter", -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 9.5px; line-height: 1.45;
    position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,0.45);
    overflow: hidden;
  }
  .watermark {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 0; opacity: 0.06;
  }
  .watermark img { width: 520px; height: auto; }
  .page > *:not(.watermark) { position: relative; z-index: 1; }

  .header {
    background: #000; color: #fff;
    display: grid; grid-template-columns: 90px 1fr auto;
    gap: 16px; padding: 14px 24px;
    align-items: center;
  }
  .header-logo { width: 74px; height: 74px; display: flex; align-items: center; justify-content: center; }
  .header-logo img { width: 100%; height: 100%; object-fit: contain; }
  .brand-block .brand {
    font-family: "Times New Roman", "Playfair Display", serif;
    font-size: 26px; font-weight: 700; letter-spacing: 0.04em; margin: 0;
  }
  .brand-block .tagline {
    color: #41B6E6; font-size: 9.5px; letter-spacing: 0.22em;
    text-transform: uppercase; margin-top: 3px; font-weight: 600;
  }
  .accent-rule {
    height: 2px; background: linear-gradient(90deg, #41B6E6 0%, #DB3EB1 100%);
    margin-top: 6px; width: 220px; border: 0;
  }
  .contact-block { text-align: right; font-size: 9.5px; line-height: 1.45; }
  .contact-block .addr { margin-bottom: 4px; }
  .contact-block .ph { font-weight: 600; }
  .contact-block .accent { color: #41B6E6; }

  .page-title {
    padding: 12px 24px 6px;
    border-bottom: 1px solid #e0e0e0;
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px;
  }
  .page-title h1 {
    margin: 0; font-size: 14px; font-weight: 800;
    letter-spacing: -0.01em; color: #000;
    text-transform: uppercase; max-width: 600px;
  }
  .page-title h1 .es {
    display: block;
    font-weight: 400; opacity: .55; font-size: 11px;
    letter-spacing: 0; text-transform: none; margin-top: 2px;
  }
  .page-title .pagenum {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    flex-shrink: 0;
  }
  .page-title .pagenum .badge {
    background: #000; color: #fff; padding: 3px 9px; border-radius: 999px;
    font-weight: 700; letter-spacing: 0.08em;
  }
  .page-title .pagenum .badge .of { opacity: 0.55; margin-left: 2px; }

  .ident-strip {
    background: #fafafa;
    border-bottom: 1px solid #d0d0d0;
    padding: 8px 24px;
    display: grid;
    gap: 12px;
  }
  .ident-strip .field label {
    display: block; font-size: 7.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: #000;
    line-height: 1.15;
  }
  .ident-strip .field .es { font-weight: 400; opacity: .55; margin-left: 4px; letter-spacing: 0; text-transform: none; }
  .ident-strip .field input {
    margin-top: 3px; width: 100%; height: 22px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; color: #000;
    padding: 1px 2px 3px; outline: none;
  }
  .ident-strip .field input:focus { background: #f3fafe; border-bottom-color: #41B6E6; }

  .body { padding: 12px 24px 14px; }
  .body p { margin: 0 0 6px 0; text-align: justify; }
  .body p strong { font-weight: 700; }
  .body .es-block {
    color: #444; font-size: 9px; margin-top: 2px; font-style: italic;
    padding-left: 10px; border-left: 2px solid #DB3EB180;
  }
  .body .divider {
    text-align: center; margin: 12px 0; font-size: 9px; color: #888;
    letter-spacing: 0.4em;
  }

  .section { margin-top: 10px; }
  .section-head {
    display: flex; align-items: center; gap: 8px; margin-bottom: 5px;
  }
  .section-num {
    font-size: 8px; font-weight: 800; letter-spacing: 0.12em;
    color: #fff; padding: 2px 7px; border-radius: 3px;
    background: linear-gradient(135deg, #41B6E6 0%, #DB3EB1 100%);
  }
  .section-title {
    margin: 0; font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.06em; color: #000;
  }
  .section-title .es {
    font-weight: 400; opacity: 0.55; font-size: 9.5px;
    letter-spacing: 0; text-transform: none; margin-left: 5px;
  }
  .section-rule {
    flex: 1; height: 1.2px;
    background: linear-gradient(90deg, #000 0%, transparent 100%);
    margin-left: 6px; opacity: 0.85;
  }

  .choice-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
  .choice {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 10px; cursor: pointer;
    padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px;
    transition: all 0.15s;
  }
  .choice:hover { border-color: #41B6E6; background: #f3fafe; }
  .choice input[type=radio] {
    width: 14px; height: 14px;
    appearance: none; -webkit-appearance: none;
    border: 1.5px solid #000; border-radius: 50%;
    background: #fff; margin: 1px 0 0 0; flex-shrink: 0;
    position: relative; cursor: pointer;
  }
  .choice input[type=radio]:checked { background: #000; }
  .choice input[type=radio]:checked::after {
    content: ""; position: absolute;
    left: 3px; top: 3px;
    width: 6px; height: 6px;
    background: #fff; border-radius: 50%;
  }
  .choice-body { flex: 1; line-height: 1.45; }
  .choice-body input[type=text] {
    margin-top: 4px;
    width: 100%; height: 22px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; padding: 1px 2px 3px;
    outline: none;
  }
  .choice-body input:focus { background: #f3fafe; border-bottom-color: #41B6E6; }

  .check-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 4px; align-items: center; }
  .check { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; cursor: pointer; }
  .check .es { font-weight: 400; opacity: .55; font-size: 9px; margin-left: 4px; }
  .check input[type=checkbox] {
    width: 13px; height: 13px;
    appearance: none; -webkit-appearance: none;
    border: 1.5px solid #000; border-radius: 3px;
    background: #fff; margin: 0; position: relative; cursor: pointer;
    flex-shrink: 0;
  }
  .check input[type=checkbox]:checked { background: #000; }
  .check input[type=checkbox]:checked::after {
    content: ""; position: absolute;
    left: 3px; top: -1px;
    width: 4px; height: 8px;
    border: solid #fff; border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .restrictions {
    margin-top: 4px; width: 100%; height: 50px;
    border: 1.5px solid #000; border-radius: 4px;
    background: transparent; font: inherit; color: #000;
    padding: 6px 8px; outline: none; resize: vertical;
  }
  .restrictions:focus { background: #f3fafe; border-color: #41B6E6; }
  .restrictions:disabled { background: #f0f0f0; opacity: 0.5; }

  .warning {
    margin: 8px 0;
    background: #fef6ef;
    border-left: 3px solid #DB3EB1;
    padding: 8px 12px;
    font-size: 9.5px;
    font-weight: 600;
    line-height: 1.45;
  }
  .warning strong { color: #B30058; }

  .sig-block {
    margin-top: 12px;
    border: 1.5px solid #000;
    border-radius: 6px;
    padding: 10px 12px 12px;
    background: rgba(255,255,255,0.6);
  }
  .sig-block .who {
    font-size: 9.5px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .sig-row { display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 10px; }
  .sig-row.three-equal { grid-template-columns: 1fr 1fr 1fr; }
  .sig-row.single { grid-template-columns: 1fr; }
  .sig-cell label {
    display: block; font-size: 7.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: #000;
  }
  .sig-cell label .hint { font-weight: 400; opacity: .55; letter-spacing: 0; text-transform: none; margin-left: 4px; }
  .sig-cell input {
    margin-top: 3px; width: 100%; height: 26px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; color: #000;
    padding: 1px 2px 3px; outline: none;
  }
  .sig-cell input:focus { background: #f3fafe; border-bottom-color: #41B6E6; }
  .sig-cell.signature input {
    font-family: "Brush Script MT", "Lucida Handwriting", cursive;
    font-size: 18px; font-style: italic;
  }

  .accent-bar {
    height: 5px;
    background: linear-gradient(90deg, #000 0%, #41B6E6 50%, #DB3EB1 100%);
    margin-top: 14px;
  }
  .footer {
    padding: 8px 24px 12px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 9px; color: #000;
  }
  .footer .initials {
    display: flex; align-items: center; gap: 8px;
    font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  }
  .footer .initials input {
    width: 80px; height: 18px; border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; text-align: center;
    text-transform: uppercase; letter-spacing: 0.18em;
    padding: 0; outline: none;
  }
  .footer .right { opacity: 0.7; }

  @media print {
    html, body { background: #fff; }
    .toolbar { display: none !important; }
    .page { box-shadow: none; margin: 0; width: 8.5in; min-height: 11in; page-break-after: always; }
    input, textarea {
      background: transparent !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .check input[type=checkbox]:checked, .choice input[type=radio]:checked {
      background: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .header, .accent-bar, .accent-rule, .warning, .sig-block, .ident-strip, .choice, .section-num, .es-block {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  }
  @page { size: Letter; margin: 0; }
"""

def page_chrome(title_en, title_es, page_num, total, body_html, store_key, page_filename, extra_script=""):
    pager = make_pager(page_filename)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pro Injury — {title_en} · CRM</title>
<style>{SHARED_CSS}</style>
</head>
<body>

<div class="toolbar">
  <div class="brand">PRO INJURY · <span class="accent">{title_en}</span></div>
  {pager}
  <div class="actions">
    <span class="saved-indicator" id="savedIndicator">●  unsaved</span>
    <button class="btn ghost" type="button" onclick="resetForm()">Reset</button>
    <button class="btn ghost" type="button" onclick="exportJSON()">Export JSON</button>
    <button class="btn ghost" type="button" onclick="document.getElementById('importFile').click()">Import JSON</button>
    <input type="file" id="importFile" accept="application/json" style="display:none" onchange="importJSON(event)">
    <button class="btn primary" type="button" onclick="window.print()">Print</button>
  </div>
</div>

<form id="proForm" autocomplete="off" onsubmit="event.preventDefault()">

<div class="page">
  <div class="watermark">{WATERMARK_IMG}</div>

  <div class="header">
    <div class="header-logo">{HEADER_LOGO_IMG}</div>
    <div class="brand-block">
      <div class="brand">PRO INJURY</div>
      <div class="tagline">Medical &amp; Rehabilitation</div>
      <hr class="accent-rule">
    </div>
    <div class="contact-block">
      <div class="addr"><span class="accent">●</span> 15165 NW 77th Ave, Suite 1001 · Miami Lakes, FL 33014</div>
      <div class="addr"><span class="accent">●</span> 6309 Corporate Court, Suite 100/103 · Fort Myers, FL 33919</div>
      <div class="ph">📞 786-362-5480 &nbsp; · &nbsp; 📠 786-362-5638</div>
      <div class="ph"><span class="accent">✉</span> admin@ProInjuryLLC.com</div>
    </div>
  </div>

  <div class="page-title">
    <h1>{title_en}<span class="es">{title_es}</span></h1>
    <div class="pagenum"><span>Page</span><span class="badge">{page_num:02d}<span class="of"> / {total:02d}</span></span></div>
  </div>

  {body_html}

  <div class="accent-bar"></div>
  <div class="footer">
    <div class="initials"><span>Patient Initials</span><input name="patient_initials_p{page_num}" type="text" maxlength="4"></div>
    <div class="right">Pro Injury Medical &amp; Rehabilitation · Rev. 2026.05 · Page {page_num:02d} of {total:02d} · CRM / Digital</div>
  </div>
</div>

</form>

<script>
(function(){{
  const form = document.getElementById('proForm');
  const indicator = document.getElementById('savedIndicator');
  const STORE_KEY = '{store_key}';
  let saveTimer = null;

  function setIndicator(state){{
    if(state==='saving'){{ indicator.textContent = '●  saving…'; indicator.style.color = '#41B6E6'; }}
    else if(state==='saved'){{ indicator.textContent = '●  saved locally'; indicator.style.color = '#7fdf7f'; }}
    else {{ indicator.textContent = '●  unsaved'; indicator.style.color = '#c8d2e0'; }}
  }}
  function collect(){{
    const data = {{}};
    for(const el of form.querySelectorAll('[name]')){{
      const n = el.name;
      if(el.type === 'checkbox'){{
        const all = form.querySelectorAll(`[name="${{n}}"][type=checkbox]`);
        if(all.length > 1) data[n] = Array.from(all).filter(x=>x.checked).map(x=>x.value);
        else data[n] = el.checked;
      }} else if(el.type === 'radio'){{
        if(el.checked) data[n] = el.value;
        else if(!(n in data)) data[n] = '';
      }} else {{
        data[n] = el.value;
      }}
    }}
    return data;
  }}
  function apply(data){{
    if(!data) return;
    for(const el of form.querySelectorAll('[name]')){{
      const v = data[el.name]; if(v === undefined) continue;
      if(el.type === 'checkbox'){{
        if(Array.isArray(v)) el.checked = v.includes(el.value);
        else el.checked = !!v;
      }} else if(el.type === 'radio'){{
        el.checked = (v === el.value);
      }} else {{
        el.value = v ?? '';
      }}
    }}
  }}
  function save(){{ try {{ localStorage.setItem(STORE_KEY, JSON.stringify(collect())); setIndicator('saved'); }} catch(e){{}} }}
  function debounceSave(){{ setIndicator('saving'); clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }}
  function load(){{
    try {{
      const raw = localStorage.getItem(STORE_KEY);
      if(raw){{ apply(JSON.parse(raw)); setIndicator('saved'); }}
      // Prefill identity from intake
      const intake = JSON.parse(localStorage.getItem('proInjury.intake.v1') || '{{}}');
      const map = {{
        patient_name: intake.patient_name,
        patient_dob: intake.dob,
        patient_phone: intake.phone_cell,
        patient_email: intake.email,
        date_of_accident: intake.meta_date_of_accident
      }};
      for(const k in map){{
        const el = form.querySelector(`[name=${{k}}]`);
        if(el && !el.value && map[k]) el.value = map[k];
      }}
    }} catch(e){{}}
  }}
  window.resetForm = function(){{
    if(!confirm('Clear all fields? This cannot be undone.')) return;
    form.reset(); localStorage.removeItem(STORE_KEY); setIndicator('unsaved');
  }};
  window.exportJSON = function(){{
    const blob = new Blob([JSON.stringify(collect(), null, 2)], {{type:'application/json'}});
    const a = document.createElement('a');
    const data = collect();
    const name = ((data.patient_name || 'patient') + '_{page_filename.replace(".html","")}.json').replace(/\\s+/g,'_');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    URL.revokeObjectURL(a.href);
  }};
  window.importJSON = function(ev){{
    const file = ev.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = () => {{ try {{ apply(JSON.parse(r.result)); save(); }} catch(e){{ alert('Invalid JSON'); }} }};
    r.readAsText(file);
  }};
  form.addEventListener('input', debounceSave);
  form.addEventListener('change', debounceSave);
  load();
{extra_script}
}})();
</script>

</body>
</html>"""

def ident_strip(include_doa=False):
    if include_doa:
        cols = "2fr 1fr 1fr 1fr"
        doa = '<div class="field"><label>Date of Accident <span class="es">/ Fecha del accidente</span></label><input type="date" name="date_of_accident"></div>'
    else:
        cols = "2fr 1fr 1fr"
        doa = ''
    return f"""<div class="ident-strip" style="grid-template-columns:{cols}">
    <div class="field"><label>Patient Name <span class="es">/ Nombre</span></label><input type="text" name="patient_name"></div>
    <div class="field"><label>Date of Birth <span class="es">/ Fecha de nacimiento</span></label><input type="date" name="patient_dob"></div>
    <div class="field"><label>Phone <span class="es">/ Teléfono</span></label><input type="tel" name="patient_phone"></div>
    {doa}
  </div>"""

def sig_block(prefix="patient", who="Patient / Guardian Signature"):
    return f"""<div class="sig-block">
    <div class="who">{who}</div>
    <div class="sig-row">
      <div class="sig-cell"><label>Patient's Name <span class="hint">Print</span></label><input type="text" name="{prefix}_name_print"></div>
      <div class="sig-cell signature"><label>Patient's Signature <span class="hint">If minor, parent/guardian</span></label><input type="text" name="{prefix}_signature"></div>
      <div class="sig-cell"><label>Date</label><input type="date" name="{prefix}_signed_date"></div>
    </div>
  </div>"""

# =====================================================================
# PAGE 02 — PIP Standard Disclosure (rebuilt with Spanish summaries)
# =====================================================================
disclosure_body = ident_strip(include_doa=True) + r"""
  <div class="body">
    <p style="text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:10px;color:#444;margin-bottom:8px;">
      Office of Insurance Regulation · Bureau of Property &amp; Casualty Forms and Rates
    </p>

    <p style="font-weight:700;">The undersigned insured person (or guardian of such person) affirms:</p>
    <p class="es-block">La persona asegurada (o su tutor) declara:</p>

    <p><strong>1.</strong> The services set forth below were actually rendered. This means that those services have already been provided at <strong>PRO INJURY, LLC</strong>.</p>
    <p class="es-block">Los servicios indicados a continuación fueron efectivamente prestados en Pro Injury, LLC.</p>
    <div class="check-row" style="margin: 6px 0 8px 0;">
      <label class="check"><input type="checkbox" name="svc_initial_visit" value="yes"> Initial Office Visit</label>
      <label class="check"><input type="checkbox" name="svc_initial_therapist_eval" value="yes"> Initial Therapist Evaluation</label>
      <label class="check"><input type="checkbox" name="svc_cold_hot" value="yes"> Cold/Hot Pack</label>
      <label class="check"><input type="checkbox" name="svc_ultrasound" value="yes"> Ultrasound</label>
      <label class="check"><input type="checkbox" name="svc_xrays" value="yes"> X-Rays</label>
      <label class="check"><input type="checkbox" name="svc_estim" value="yes"> Electric Stimulation</label>
      <label class="check"><input type="checkbox" name="svc_massage" value="yes"> Massage</label>
      <label class="check"><input type="checkbox" name="svc_therapeutic" value="yes"> Therapeutic Exercises</label>
      <label class="check"><input type="checkbox" name="svc_paraffin" value="yes"> Paraffin</label>
      <label class="check"><input type="checkbox" name="svc_infrared" value="yes"> Infrared</label>
    </div>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
      <label class="check"><input type="checkbox" name="svc_other" value="yes"> Other:</label>
      <input type="text" name="svc_other_text" placeholder="" style="flex:1;border:0;border-bottom:1.5px solid #000;background:transparent;font:inherit;padding:1px 2px 3px;outline:none;height:20px;">
    </div>

    <p><strong>2.</strong> I have a right and the <strong>duty to confirm</strong> that the services have already been provided.</p>
    <p class="es-block">Tengo el derecho y el deber de confirmar que los servicios fueron prestados.</p>

    <p><strong>3.</strong> I was <strong>not solicited</strong> by any person to seek any services from the medical provider of the services described above.</p>
    <p class="es-block">No fui solicitado por ninguna persona para buscar servicios del proveedor médico mencionado.</p>

    <p><strong>4.</strong> The medical provider has <strong>explained</strong> the services to me for which payment is being claimed.</p>
    <p class="es-block">El proveedor médico me ha explicado los servicios por los que se reclama el pago.</p>

    <p><strong>5.</strong> If I notify the insurer in writing of a billing error, I may be entitled to a portion of any reduction in the amounts paid by my motor vehicle insurer — <strong>at least 20% of the reduction, up to $500</strong>.</p>
    <p class="es-block">Si notifico por escrito al asegurador de un error de facturación, podría tener derecho al menos al 20% de la reducción, hasta $500.</p>

    <div class="section">
      <div class="section-head">
        <span class="section-num">PROVIDER</span>
        <h2 class="section-title">Licensed Medical Professional Affirmations <span class="es">/ Declaraciones del Proveedor</span></h2>
        <div class="section-rule"></div>
      </div>
      <p style="font-weight:600;font-size:10px;">The undersigned licensed medical professional affirms statement 1 above and also:</p>

      <p><strong>A.</strong> I have <strong>not solicited</strong> or caused the insured person to be solicited to make a claim for PIP benefits.</p>
      <p><strong>B.</strong> I have <strong>explained</strong> the services rendered sufficiently for that person to sign this form with informed consent.</p>
      <p><strong>C.</strong> The accompanying statement or bill is properly completed in all material provisions — truthfully, accurately, and in a substantially complete manner.</p>
      <p><strong>D.</strong> The coding of procedures is proper — no service has been upcoded, unbundled, or constitutes an invalid or not medically necessary diagnostic test as defined by Section 627.732(15)–(16) or 627.736(5)(b)6, Florida Statutes.</p>
    </div>

    """ + sig_block("insured", "Insured Person / Guardian") + sig_block("provider", "Licensed Medical Professional Rendering Treatment") + """

    <div class="warning">
      Any person who knowingly and with intent to injure, defraud, or deceive any insurer files a statement of claim or an application containing false, incomplete, or misleading information is guilty of a <strong>felony of the third degree</strong> per Section 817.234(1), Florida Statutes.
      <div class="es-block" style="margin-top:4px;border-left-color:#000;">Cualquier persona que a sabiendas y con intención de defraudar presente información falsa a un asegurador comete delito grave de tercer grado (Sección 817.234(1), Estatutos de Florida).</div>
    </div>

    <p style="font-size:9px;background:#f3fafe;border-left:3px solid #41B6E6;padding:8px 12px;margin-top:6px;">
      <strong>Note:</strong> The original of this form must be furnished to the insurer pursuant to Section 627.736(4)(b), Florida Statutes and <strong>may not be electronically furnished</strong>. Failure to furnish this form may result in non-payment of the claim.
      <span class="es-block" style="margin-top:4px;border-left-color:#41B6E6;">Nota: El original debe enviarse al asegurador por correo físico (no electrónico). De lo contrario, el reclamo podría no ser pagado.</span>
    </p>
  </div>
"""

# =====================================================================
# PAGE 03 — AOB (rebuilt with Spanish summaries)
# =====================================================================
aob_body = ident_strip() + r"""
  <div class="body">
    <p>I, the undersigned patient/insured, knowingly, voluntarily and intentionally assign the rights and benefits of my automobile insurance, also known as Personal Injury Protection ("<strong>PIP</strong>") and Medical Payments policy of insurance, to the above healthcare provider ("<strong>PRO INJURY</strong>"). I understand it is the intention of PRO INJURY to accept this assignment of benefits in lieu of demanding payment at the time services are rendered, and that this document allows PRO INJURY to file suit against an insurer for payment of the insurance benefits. This assignment includes overdue interest payments and any potential claim for bad faith. If the insurer disputes the validity of this assignment, the insurer is instructed to notify PRO INJURY in writing within <strong>five (5) days</strong> of receipt or it waives that defense. The insurer is directed to pay PRO INJURY directly without including my name on the check.</p>
    <p class="es-block">Cedo a Pro Injury los derechos y beneficios de mi seguro PIP y Med Pay. Pro Injury acepta esta cesión en lugar de cobrarme al momento del servicio, y puede demandar al asegurador. Si el asegurador disputa la cesión, debe notificarlo por escrito dentro de 5 días o pierde esa defensa. El asegurador debe pagar directamente a Pro Injury.</p>

    <p>The insurer is directed by PRO INJURY and the undersigned to issue any checks in partial settlement of a claim that contain or are accompanied by language releasing the insurer or its insured/patient from liability. The insured and PRO INJURY hereby <strong>contest and object</strong> to any reductions or partial payments. Any partial or reduced payment, regardless of accompanying language, deposited by PRO INJURY shall be done so <strong>under protest</strong>, at the risk of the insurer, and shall not be deemed a waiver, accord, satisfaction, discharge, settlement or agreement by PRO INJURY to accept a reduced amount as payment in full. PRO INJURY reserves the right to seek the full amount of the bills submitted.</p>
    <p class="es-block">Cualquier pago parcial o reducido se acepta bajo protesta. No constituye renuncia ni acuerdo. Pro Injury se reserva el derecho de cobrar el monto total facturado.</p>

    <p>If the insurer schedules an examination under oath ("<strong>EUO</strong>"), the insurer is hereby <strong>INSTRUCTED</strong> to send a copy of said notification to PRO INJURY. PRO INJURY or its attorneys are expressly authorized to appear at any EUO or IME set by the insurer. The assignment applies to both past and future medical expenses and is valid even if undated. A photocopy of this assignment is to be considered as valid as the original. I agree to pay any applicable deductible, co-payments, services rendered after policy exhaustion, and any other services unrelated to the auto accident.</p>
    <p class="es-block">Si el asegurador programa un EUO o IME, debe notificar a Pro Injury, y Pro Injury o sus abogados pueden asistir. La cesión cubre gastos pasados y futuros. Acepto pagar deducibles, copagos y servicios no relacionados.</p>

    <p><strong>Release of Information:</strong> I authorize PRO INJURY to furnish my insurer, other medical providers, and my attorney — via mail, fax, or email — with all information contained in my medical records; to obtain insurance coverage information (declaration sheet &amp; policy) in writing and telephonically from the insurer; to request all explanations of benefits (EOBs) and non-redacted PIP payout sheets; to obtain any written and verbal statements provided to the insurer (including EUOs); and to obtain copies of the entire claim file and all medical records from any other provider or insurer. PRO INJURY may produce my medical records to its attorney in connection with any pending lawsuits. The insurer must keep my medical records private and confidential and is not authorized to release them without my prior express written authorization.</p>
    <p class="es-block">Autorizo a Pro Injury a compartir mis expedientes médicos con aseguradoras, otros proveedores y abogados, y a obtener información del seguro, EOBs, hojas de pago PIP, y declaraciones del asegurador. El asegurador debe mantener mis registros médicos privados.</p>

    <p><strong>Demand:</strong> Demand is hereby made for the insurer to pay all bills within <strong>30 days</strong> without reductions and to mail the latest non-redacted PIP payout sheet and the insurance coverage declaration sheet within <strong>15 days</strong>. The insurer is directed to pay bills in the order received. If a bill from PRO INJURY and a claim from anyone else is received on the same day, the insurer must <strong>not</strong> apply PRO INJURY's bill to the deductible and must pay PRO INJURY first. If any PRO INJURY bill is disputed or reduced, the insurer must <strong>set aside (escrow)</strong> the disputed amount and inform PRO INJURY in writing of the dispute.</p>
    <p class="es-block">Exijo que el asegurador pague todas las facturas en 30 días sin reducciones, envíe la hoja de cobertura en 15 días, pague a Pro Injury primero, y deje en custodia (escrow) cualquier monto disputado.</p>

    <p><strong>Certification:</strong> I certify that I have read and agree to the above; I have not been solicited or promised anything in exchange for my treatment; I have not received any promises or guarantees of results; and I agree that PRO INJURY's prices are reasonable, usual, and customary.</p>
    <p class="es-block">Certifico que he leído y acepto este documento, no fui solicitado ni me prometieron resultados, y acepto que los precios de Pro Injury son razonables y habituales.</p>

    <div class="warning">
      ⚠ Caution: Please read before signing and ask to view our charges. If you don't understand this document, please ask us to explain it. If you sign below, we assume you understood it and agreed to the above terms.
      <div class="es-block" style="margin-top:4px;border-left-color:#000;">Precaución: Lea antes de firmar y pida ver nuestros cargos. Si no entiende este documento, pídanos que se lo expliquemos.</div>
    </div>

    """ + sig_block("patient") + """
  </div>
"""

# =====================================================================
# PAGE 04 — HIPAA Consent + Acknowledgement (MERGED)
# =====================================================================
hipaa_body = ident_strip() + r"""
  <div class="body">
    <p>I, <strong><span id="nameRef1" style="font-weight:700;border-bottom:1.5px dotted #888;padding:0 14px;display:inline-block;min-width:180px;"></span></strong>, understand that as part of my health care <strong>PRO INJURY</strong> originates and maintains paper and/or electronic records describing my health history, symptoms, examination and test results, diagnoses, treatment, and any plans for future care or treatment. This information serves as:</p>
    <ul style="margin:4px 0 6px 22px;padding:0;">
      <li>A basis for planning my care and treatment;</li>
      <li>A means of communication among healthcare professionals who contribute to my care;</li>
      <li>A source of information for applying my diagnosis and procedural information to my bill;</li>
      <li>A means by which a third-party payer can verify that services billed were actually provided; and</li>
      <li>A tool for routine healthcare operations such as assessing quality and reviewing competence.</li>
    </ul>
    <p class="es-block">Entiendo que Pro Injury mantiene mis registros médicos, los cuales se usan para planificar mi atención, comunicar entre profesionales, facturar, verificar servicios con aseguradoras y para operaciones de calidad.</p>

    <p>I have been provided with a <em>Notice of Privacy Practices</em>. I understand I have the right to:</p>
    <ul style="margin:4px 0 6px 22px;padding:0;">
      <li>Review the notice prior to signing this consent;</li>
      <li>Object to the use of my health information for marketing or fundraising purposes;</li>
      <li>Request restrictions on how my health information is used or disclosed.</li>
    </ul>
    <p class="es-block">He recibido el Aviso de Prácticas de Privacidad y entiendo mis derechos a revisarlo, objetar usos de mercadeo, y solicitar restricciones.</p>

    <p>I, <strong><span id="nameRef2" style="font-weight:700;border-bottom:1.5px dotted #888;padding:0 14px;display:inline-block;min-width:180px;"></span></strong>, understand that <strong>PRO INJURY</strong> is not required to agree to the restrictions requested. I may revoke this consent in writing, except to the extent the organization has already taken action in reliance thereon. By refusing to sign or revoking this consent, this organization may refuse to treat me as permitted by Section 164.506 of the Code of Federal Regulations. PRO INJURY reserves the right to change its notice and practices and will send a copy of any revised notice to the address I've provided.</p>
    <p class="es-block">Pro Injury no está obligado a aceptar mis restricciones. Puedo revocar este consentimiento por escrito. Pro Injury puede negarse a tratarme si no firmo o si revoco, según la ley federal.</p>

    <div class="section">
      <div class="section-head">
        <span class="section-num">01</span>
        <h2 class="section-title">Restrictions or Authorization <span class="es">/ Restricciones o Autorización</span></h2>
        <div class="section-rule"></div>
      </div>
      <label class="check"><input type="checkbox" name="no_restrictions" value="yes" id="noRestrictionsCb"> I have <strong style="margin:0 3px">no</strong> restrictions or special authorizations <span class="es">/ No tengo restricciones</span></label>
      <textarea class="restrictions" name="restrictions" id="restrictionsBox" placeholder="If you have restrictions or special authorizations, list them here / Si tiene restricciones, escríbalas aquí"></textarea>
    </div>

    <p>I consent that, as part of treatment, payment, or healthcare operations, it may be necessary to disclose my protected health information to another entity (including by fax or email).</p>
    <p class="es-block">Consiento que mi información médica protegida sea divulgada a otras entidades como parte del tratamiento, pago u operaciones médicas (incluyendo fax o correo electrónico).</p>

    <div class="section">
      <div class="section-head">
        <span class="section-num">02</span>
        <h2 class="section-title">Communication Consent <span class="es">/ Consentimiento de Comunicación</span></h2>
        <div class="section-rule"></div>
      </div>
      <div class="check-row">
        <label class="check"><input type="checkbox" name="consent_sms" value="yes"> SMS reminders <span class="es">/ Recordatorios por texto</span></label>
        <label class="check"><input type="checkbox" name="consent_email" value="yes"> Email reminders <span class="es">/ Por correo</span></label>
        <label class="check"><input type="checkbox" name="consent_voicemail" value="yes"> Voicemail <span class="es">/ Mensajes de voz</span></label>
        <label class="check"><input type="checkbox" name="consent_billing_electronic" value="yes"> Electronic billing <span class="es">/ Facturación electrónica</span></label>
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <span class="section-num">03</span>
        <h2 class="section-title">How Did You Hear About Us? <span class="es">/ ¿Cómo se enteró de nosotros?</span></h2>
        <div class="section-rule"></div>
      </div>
      <div class="check-row">
        <label class="check"><input type="checkbox" name="referral_source" value="attorney"> Attorney</label>
        <label class="check"><input type="checkbox" name="referral_source" value="friend_family"> Friend / Family</label>
        <label class="check"><input type="checkbox" name="referral_source" value="google"> Google / Online</label>
        <label class="check"><input type="checkbox" name="referral_source" value="social_media"> Social Media</label>
        <label class="check"><input type="checkbox" name="referral_source" value="prior_patient"> Returning Patient</label>
        <label class="check"><input type="checkbox" name="referral_source" value="other"> Other</label>
      </div>
      <input type="text" name="referral_source_other" placeholder="If Other, please specify / Si Otro, especifique" style="margin-top:6px;width:100%;height:22px;border:0;border-bottom:1.5px solid #000;background:transparent;font:inherit;padding:1px 2px 3px;outline:none;">
    </div>

    <p style="margin-top:8px;font-weight:600;">I acknowledge that I may revoke this consent in writing at any time, subject to the limits described above.
    <span class="es-block" style="margin-top:2px;">Reconozco que puedo revocar este consentimiento por escrito en cualquier momento.</span></p>

    <div class="section">
      <div class="section-head">
        <span class="section-num">04</span>
        <h2 class="section-title">Acknowledgement of Receipt of Notice of Privacy Practices <span class="es">/ Acuse de Recibo</span></h2>
        <div class="section-rule"></div>
      </div>
      <p style="font-size:9.5px;">I confirm that I have received a copy of the Pro Injury Medical &amp; Rehabilitation <strong>Notice of Privacy Practices</strong>. I understand that this notice may be updated, and I may obtain a revised copy by calling or visiting either office.
      <span class="es-block" style="margin-top:2px;">Confirmo haber recibido el Aviso de Prácticas de Privacidad de Pro Injury, y puedo obtener una copia actualizada en cualquier momento.</span></p>

      <label class="check" style="margin-top:6px;"><input type="checkbox" name="ack_received_npp" value="yes"> I have received the Notice of Privacy Practices <span class="es">/ He recibido el aviso</span></label>
    </div>

    <div class="sig-block">
      <div class="who">Patient / Guardian Signature</div>
      <div class="sig-row">
        <div class="sig-cell"><label>Patient's Name <span class="hint">Print</span></label><input type="text" name="patient_name_print" id="patientNamePrint"></div>
        <div class="sig-cell signature"><label>Patient's Signature</label><input type="text" name="patient_signature"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="patient_signed_date"></div>
      </div>
      <div class="sig-row three-equal" style="margin-top:10px;">
        <div class="sig-cell"><label>Parent / Guardian Name <span class="hint">if minor</span></label><input type="text" name="guardian_name"></div>
        <div class="sig-cell signature"><label>Parent / Guardian Signature</label><input type="text" name="guardian_signature"></div>
        <div class="sig-cell"><label>Relationship</label><input type="text" name="guardian_relationship"></div>
      </div>
      <div class="sig-row" style="margin-top:10px;">
        <div class="sig-cell"><label>Witness Name <span class="hint">Pro Injury staff</span></label><input type="text" name="witness_name"></div>
        <div class="sig-cell signature"><label>Witness Signature</label><input type="text" name="witness_signature"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="witness_date"></div>
      </div>
    </div>
  </div>
"""

hipaa_extra_script = r"""
  // HIPAA-specific name + restrictions sync
  const nameRef1 = document.getElementById('nameRef1');
  const nameRef2 = document.getElementById('nameRef2');
  const nameInput = form.querySelector('[name=patient_name]');
  const printInput = document.getElementById('patientNamePrint');
  const noRestrictionsCb = document.getElementById('noRestrictionsCb');
  const restrictionsBox = document.getElementById('restrictionsBox');
  function syncName(){
    const v = nameInput && nameInput.value || '';
    if(nameRef1) nameRef1.textContent = v;
    if(nameRef2) nameRef2.textContent = v;
    if(printInput && !printInput.value) printInput.value = v;
  }
  function syncRestrictions(){
    if(!noRestrictionsCb || !restrictionsBox) return;
    if(noRestrictionsCb.checked){ restrictionsBox.value=''; restrictionsBox.disabled=true; }
    else restrictionsBox.disabled = false;
  }
  if(nameInput) nameInput.addEventListener('input', syncName);
  if(noRestrictionsCb) noRestrictionsCb.addEventListener('change', syncRestrictions);
  syncName(); syncRestrictions();
"""

# =====================================================================
# PAGE 05 — Fraud Statement
# =====================================================================
fraud_body = ident_strip(include_doa=True) + r"""
  <div class="body">
    <p style="font-weight:700;text-transform:uppercase;letter-spacing:0.04em;font-size:11px;">I attest that:</p>
    <ul style="margin:4px 0 8px 22px;padding:0;">
      <li>I was involved in a motor vehicle accident on the date of accident above and, as a result, I suffered personal bodily injury, pain and suffering, and I have independently and voluntarily sought medical care and treatment for such damages.</li>
      <li>I have selected my medical doctors, hospital, or clinic individually, freely, and without duress, urging, or coercion.</li>
      <li>I have <strong>not</strong> been unlawfully or wrongly assisted or urged by any attorney, or any other person, to make a fraudulent or false civil damages claim.</li>
      <li>This personal injury claim is presented solely because of the bodily injuries truly suffered by me as a result of the motor vehicle accident.</li>
      <li>No one has conspired with me or on my behalf to induce, assist, or urge me to make a fraudulent civil action damages claim or to fraudulently violate Florida Law.</li>
      <li>For the benefit of any and all insurance companies involved, or other persons related to this accident, I am legitimately injured and truly suffering pain.</li>
      <li>I have read and understand the contents of this <strong>FRAUD STATEMENT</strong> and it expresses the truth and facts contained therein.</li>
    </ul>
    <p>I authorize Pro Injury Medical &amp; Rehabilitation to release this statement to anyone.</p>

    <div class="es-block" style="margin-top:8px;padding:8px 12px;border-left-width:3px;">
      <strong>Declaración Anti-Fraude:</strong> Doy fe de que estuve involucrado en un accidente automovilístico, sufrí lesiones físicas reales, busqué tratamiento médico por voluntad propia, no he sido inducido por nadie a hacer un reclamo fraudulento, presento este reclamo únicamente por las lesiones reales, no he conspirado con nadie, estoy legítimamente lesionado, y he leído y comprendido esta declaración. Autorizo a Pro Injury a divulgarla.
    </div>

    """ + sig_block("fraud") + """
  </div>
"""

# =====================================================================
# PAGE 06 — Financial Responsibility + Deductible (MERGED)
# =====================================================================
financial_body = ident_strip() + r"""
  <div class="body">

    <div class="section">
      <div class="section-head">
        <span class="section-num">01</span>
        <h2 class="section-title">Financial Responsibility <span class="es">/ Responsabilidad Financiera</span></h2>
        <div class="section-rule"></div>
      </div>
      <p>I understand that, as a patient of Pro Injury Medical &amp; Rehabilitation, <strong>if my insurance coverage is not verified, benefits are not authorized by my insurance carrier, or a deductible is applied,</strong> I am responsible for all the charges incurred during my treatment and any balance not paid by my insurance company and owed to this medical center. This notice has been read, informed, and explained to me in detail.</p>
      <p class="es-block">Como paciente de Pro Injury, si mi cobertura no es verificada, los beneficios no son autorizados, o se aplica un deducible, soy responsable de todos los cargos y de cualquier balance no pagado por mi compañía de seguro. Este aviso me fue leído, informado y explicado en detalle.</p>
    </div>

    <div class="section">
      <div class="section-head">
        <span class="section-num">02</span>
        <h2 class="section-title">Deductible — Payment Method <span class="es">/ Método de Pago del Deducible</span></h2>
        <div class="section-rule"></div>
      </div>
      <p>If there is a deductible in your PIP policy, how would you prefer to pay for the services not covered by your insurance policy? Please choose <strong>one</strong>.
      <span class="es-block" style="margin-top:2px;">Si su póliza PIP tiene un deducible, ¿cómo prefiere pagar los servicios no cubiertos? Elija <strong>una</strong> opción.</span></p>

      <div class="choice-list">
        <label class="choice">
          <input type="radio" name="deductible_choice" value="payment_plan">
          <div class="choice-body">
            <strong>Set up a payment plan with this office</strong>
            <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Plan de pagos</span>
          </div>
        </label>
        <label class="choice">
          <input type="radio" name="deductible_choice" value="check">
          <div class="choice-body">
            <strong>I will pay by check for the amount not covered</strong>
            <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Pagaré con cheque</span>
          </div>
        </label>
        <label class="choice">
          <input type="radio" name="deductible_choice" value="card_on_file">
          <div class="choice-body">
            <strong>Charge a credit card on file</strong>
            <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Tarjeta de crédito</span>
            <div class="warning" style="margin:6px 0 0;">⚠ <strong>For security, do NOT write your card number on this paper form.</strong> A Pro Injury staff member will collect it directly through our secure payment terminal.
            <span class="es-block" style="margin-top:4px;border-left-color:#000;">No escriba el número de su tarjeta en este formulario. Un miembro del personal lo procesará en nuestra terminal segura.</span></div>
            <div class="check-row" style="margin-top:6px;">
              <label class="check"><input type="checkbox" name="cc_visa" value="yes"> Visa</label>
              <label class="check"><input type="checkbox" name="cc_mc" value="yes"> Mastercard</label>
              <label class="check"><input type="checkbox" name="cc_amex" value="yes"> American Express</label>
              <label class="check"><input type="checkbox" name="cc_discover" value="yes"> Discover</label>
            </div>
          </div>
        </label>
        <label class="choice">
          <input type="radio" name="deductible_choice" value="bill_attorney">
          <div class="choice-body">
            <strong>Send the bill to my Attorney</strong>
            <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Enviar al abogado</span>
            <input type="text" name="attorney_firm" placeholder="Law firm / Bufete">
            <input type="text" name="attorney_name" placeholder="Attorney name / Nombre del abogado">
            <input type="text" name="attorney_phone" placeholder="Phone / Teléfono">
          </div>
        </label>
        <label class="choice">
          <input type="radio" name="deductible_choice" value="hardship">
          <div class="choice-body">
            <strong>Request a financial hardship review</strong>
            <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Revisión por dificultad económica</span>
          </div>
        </label>
      </div>
    </div>

    """ + sig_block("financial") + """
  </div>
"""

# =====================================================================
# PAGE 07 — Treatment Consent + Radiology Warning (MERGED)
# =====================================================================
treatment_body = ident_strip() + r"""
  <div class="body">

    <div class="section">
      <div class="section-head">
        <span class="section-num">01</span>
        <h2 class="section-title">Consent for Treatment <span class="es">/ Consentimiento para Tratamiento</span></h2>
        <div class="section-rule"></div>
      </div>
      <p>The undersigned has been informed of the treatment considered necessary for the patient whose name appears above. Treatment and procedures will be performed by physicians and employees of Pro Injury Medical &amp; Rehabilitation.</p>
      <p>Authorization is hereby granted for such treatment, procedures, and the administration of anesthetics, medications, or other therapies that may be deemed necessary.</p>
      <p>I consent — for myself or on behalf of the patient — to the selection and assignment of physician, and I agree to make arrangements with him or her for obtaining a complete diagnosis and continuation of treatment as needed.</p>
      <p>I certify that I have read the above authorization and understand it. I also certify that no guarantee or assurance has been made as to the results that may be obtained by this treatment.</p>
      <div class="es-block" style="margin-top:6px;padding:8px 12px;border-left-width:3px;">
        He sido informado del tratamiento necesario, el cual será realizado por los doctores y el personal de Pro Injury. Autorizo el tratamiento, procedimientos y administración de medicamentos. Consiento la designación del médico. Certifico que he leído y comprendo esta autorización y que no se me ha dado ninguna garantía sobre los resultados.
      </div>
      <p style="font-style:italic;font-size:9px;opacity:.7;margin-top:8px;">* All authorizations must be signed by the patient or an authorized person in the case of a minor or when the patient is physically or mentally incapacitated. / Toda autorización debe ser firmada por el paciente o por una persona autorizada en caso de menores o incapacidad.</p>
    </div>

    <div class="section">
      <div class="section-head">
        <span class="section-num">02</span>
        <h2 class="section-title">Radiology Warning <span class="es">/ Advertencia de Radiología</span></h2>
        <div class="section-rule"></div>
      </div>
      <p>The following statement must be read and signed by <strong>all female patients of child-bearing age</strong> who are scheduled for diagnostic X-rays. X-rays taken during pregnancy may be extremely dangerous to the unborn child unless adequate precautions are applied during the procedure. Please inform the X-ray technician if there is any possibility that you are pregnant. Sign the statement below only if you are <strong>not</strong> pregnant.</p>
      <p class="es-block">Las pacientes mujeres en edad fértil que se sometan a rayos-X deben leer y firmar lo siguiente. Los rayos-X durante el embarazo pueden ser peligrosos para el bebé. Informe al técnico si existe posibilidad de embarazo. Firme solo si NO está embarazada.</p>

      <div class="warning" style="margin:8px 0;">
        <strong>STATEMENT / DECLARACIÓN:</strong> I certify, to the best of my knowledge, that I am <strong>not pregnant</strong> at this time, and I authorize the X-rays to be taken of myself.
        <div class="es-block" style="margin-top:4px;border-left-color:#000;">Certifico, a mi mejor saber, que <strong>no estoy embarazada</strong> en este momento, y autorizo a que se me realicen los rayos-X necesarios.</div>
      </div>

      <div class="check-row">
        <label class="check"><input type="checkbox" name="not_pregnant_attest" value="yes"> I attest I am not pregnant <span class="es">/ No estoy embarazada</span></label>
        <label class="check"><input type="checkbox" name="not_applicable" value="yes"> Not applicable <span class="es">/ No aplica</span></label>
      </div>
    </div>

    """ + sig_block("treatment") + """
  </div>
"""

# =====================================================================
# PAGE 08 — Authorization for Health Info Disclosure (records request)
# =====================================================================
records_body = ident_strip(include_doa=True) + r"""
  <div class="body">
    <p style="text-align:center;font-weight:600;font-size:9.5px;color:#444;margin-bottom:8px;">
      This form complies with the HIPAA Privacy Rule and Florida Administrative Code §64B8-10.003<br>
      <em style="opacity:.7">Este formulario cumple con la Regla de Privacidad HIPAA y el Código Administrativo de Florida</em>
    </p>

    <div class="section">
      <div class="section-head">
        <span class="section-num">01</span>
        <h2 class="section-title">Records to be Released From <span class="es">/ Registros a Liberar Desde</span></h2>
        <div class="section-rule"></div>
      </div>
      <div class="row" style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">
        <div class="field"><label class="lbl" style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Provider / Facility Name <span class="es">/ Nombre del proveedor</span></label><input type="text" name="release_from_name" style="margin-top:3px;width:100%;height:22px;border:0;border-bottom:1.5px solid #000;background:transparent;font:inherit;padding:1px 2px 3px;outline:none;"></div>
        <div class="field"><label class="lbl" style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Phone <span class="es">/ Teléfono</span></label><input type="tel" name="release_from_phone" style="margin-top:3px;width:100%;height:22px;border:0;border-bottom:1.5px solid #000;background:transparent;font:inherit;padding:1px 2px 3px;outline:none;"></div>
      </div>
      <div class="field" style="margin-top:4px;"><label class="lbl" style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Address <span class="es">/ Dirección</span></label><input type="text" name="release_from_address" style="margin-top:3px;width:100%;height:22px;border:0;border-bottom:1.5px solid #000;background:transparent;font:inherit;padding:1px 2px 3px;outline:none;"></div>
    </div>

    <p style="margin-top:10px;">This is the patient's request for records pursuant to the Florida Administrative Code §64B8-10.003. The undersigned patient hereby authorizes the above-listed medical provider(s) to disclose <strong>any and all</strong> protected health/medical information they possess or have access to pertaining to the patient and date of accident captioned above. I specifically authorize the release of any and all medical bills and reports; X-rays and/or MRI reports (films only if specifically requested); hospital bills and records; and any information or data which in any way relates to the patient and his/her date of accident, to:</p>

    <p style="font-weight:700;text-align:center;background:#f3fafe;border:1px solid #41B6E6;border-radius:6px;padding:8px;margin:8px 0;">PRO INJURY MEDICAL &amp; REHABILITATION<br>15165 NW 77th Ave, Suite 1001 · Miami Lakes, FL 33014<br>Phone: 786-362-5480 · Fax: 786-362-5638</p>

    <p class="es-block">Esta es la solicitud del paciente de sus registros médicos según el Código Administrativo de Florida §64B8-10.003. Autorizo al proveedor mencionado a divulgar todos los registros médicos, facturas, imágenes y datos relacionados con el accidente, a Pro Injury Medical &amp; Rehabilitation.</p>

    <p>The information to be disclosed concerns the services rendered from the accident date and all subsequent services related to the accident. The purpose of this request is for the preparation of a legal case. This authorization will expire on the date below, or at the conclusion of the patient's legal case, whichever occurs first.</p>
    <p class="es-block">La información a divulgar es de los servicios relacionados con el accidente. El propósito es la preparación de un caso legal. Esta autorización vence en la fecha indicada o al concluir el caso, lo que ocurra primero.</p>

    <div class="section">
      <div class="section-head">
        <span class="section-num">02</span>
        <h2 class="section-title">Expiration <span class="es">/ Vencimiento</span></h2>
        <div class="section-rule"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">
        <div class="field"><label class="lbl" style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Expiration Date <span class="es">/ Fecha de vencimiento</span></label><input type="date" name="expiration_date" style="margin-top:3px;width:100%;height:22px;border:0;border-bottom:1.5px solid #000;background:transparent;font:inherit;padding:1px 2px 3px;outline:none;"></div>
        <div style="display:flex;align-items:flex-end"><label class="check"><input type="checkbox" name="expire_at_case_end" value="yes"> Expires at conclusion of legal case <span class="es">/ Vence al concluir el caso legal</span></label></div>
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <span class="section-num">03</span>
        <h2 class="section-title">Sensitive Information Authorization <span class="es">/ Información Médica Sensible</span></h2>
        <div class="section-rule"></div>
      </div>
      <p style="font-size:9.5px;">My health record may include information about treatment of the following sensitive categories. <strong>I specifically authorize the release of the categories I check below</strong> (leave unchecked to withhold).
      <span class="es-block" style="margin-top:2px;">Autorizo específicamente la divulgación de las categorías que marco abajo (desmarcadas = no autorizadas).</span></p>
      <div class="check-row" style="margin-top:6px;">
        <label class="check"><input type="checkbox" name="sens_drug_alcohol" value="yes"> Drug / Alcohol Abuse Treatment <span class="es">/ Drogas o alcohol</span></label>
        <label class="check"><input type="checkbox" name="sens_mental" value="yes"> Mental Health Treatment <span class="es">/ Salud mental</span></label>
        <label class="check"><input type="checkbox" name="sens_hiv_aids" value="yes"> HIV / AIDS <span class="es">/ VIH / SIDA</span></label>
        <label class="check"><input type="checkbox" name="sens_std" value="yes"> Sexually Transmitted Disease <span class="es">/ ETS</span></label>
        <label class="check"><input type="checkbox" name="sens_tb" value="yes"> Tuberculosis <span class="es">/ Tuberculosis</span></label>
        <label class="check"><input type="checkbox" name="sens_genetic" value="yes"> Genetic Information <span class="es">/ Información genética</span></label>
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <span class="section-num">04</span>
        <h2 class="section-title">Patient's Rights &amp; Acknowledgements <span class="es">/ Derechos del Paciente</span></h2>
        <div class="section-rule"></div>
      </div>
      <ul style="margin:4px 0 6px 22px;padding:0;font-size:9.5px;">
        <li>I have the right to revoke this authorization at any time in writing, addressed to the privacy officer of the facility above. Revocation does not apply to information already released.</li>
        <li>Any disclosure of information may be subject to re-disclosure by the recipient and may no longer be protected by federal or state law.</li>
        <li>I need not sign this authorization to assure treatment.</li>
        <li>I may inspect and/or copy the information to be disclosed.</li>
        <li>Authorizing this disclosure is voluntary.</li>
        <li>If I have any questions, I may contact the privacy officer at the facility listed above and request a copy of this authorization.</li>
      </ul>
      <p class="es-block">Puedo revocar esta autorización por escrito en cualquier momento; el destinatario puede re-divulgar la información; no necesito firmar para recibir tratamiento; puedo inspeccionar y copiar la información; firmar es voluntario; puedo contactar al oficial de privacidad para preguntas.</p>
    </div>

    """ + sig_block("records") + r"""
    <div class="sig-block" style="margin-top:10px;">
      <div class="who">Witness <span style="font-weight:400;opacity:.55;text-transform:none;letter-spacing:0;">/ Testigo</span></div>
      <div class="sig-row">
        <div class="sig-cell"><label>Witness Name <span class="hint">Pro Injury staff</span></label><input type="text" name="witness_name"></div>
        <div class="sig-cell signature"><label>Witness Signature</label><input type="text" name="witness_signature"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="witness_date"></div>
      </div>
    </div>
  </div>
"""

# =====================================================================
# WRITE OUT
# =====================================================================
pages_to_build = [
    ("disclosure.html", 2, "PIP Standard Disclosure",                     "Divulgación Estándar de PIP",      disclosure_body, "proInjury.disclosure.v1", ""),
    ("aob.html",        3, "Assignment of Benefits, Release &amp; Demand", "Cesión de Beneficios, Liberación y Demanda", aob_body,        "proInjury.aob.v1",        ""),
    ("hipaa.html",      4, "HIPAA Consent &amp; Privacy Acknowledgement",  "Consentimiento HIPAA y Acuse de Privacidad", hipaa_body,      "proInjury.hipaa.v1",      hipaa_extra_script),
    ("fraud.html",      5, "Fraud Statement",                              "Declaración Anti-Fraude",          fraud_body,      "proInjury.fraud.v1",      ""),
    ("financial.html",  6, "Financial Responsibility &amp; Deductible",    "Responsabilidad Financiera y Deducible", financial_body, "proInjury.financial.v1",  ""),
    ("treatment.html",  7, "Treatment Consent &amp; Radiology",            "Consentimiento de Tratamiento y Radiología", treatment_body,  "proInjury.treatment.v1",  ""),
    ("records.html",    8, "Authorization for Health Info Disclosure",     "Autorización de Divulgación de Información Médica", records_body, "proInjury.records.v1", ""),
]

for filename, num, t_en, t_es, body, store, extra in pages_to_build:
    html = page_chrome(t_en, t_es, num, TOTAL, body, store, filename, extra_script=extra)
    out_path = os.path.join(DESIGN_DIR, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {out_path} ({os.path.getsize(out_path)} bytes)")

# Delete old pages that have been merged in
OBSOLETE = ["consent.html", "priv_ack.html", "finresp.html", "deductible.html", "radiology.html"]
for n in OBSOLETE:
    p = os.path.join(DESIGN_DIR, n)
    if os.path.exists(p):
        os.remove(p)
        print(f"removed obsolete: {p}")
