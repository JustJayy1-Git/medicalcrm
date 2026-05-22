#!/usr/bin/env python3
"""Build pages 05-10 of the Pro Injury intake packet:
  05 priv_ack.html       - Acknowledgement of Receipt of Notice of Privacy Practices
  06 fraud.html          - Fraud Statement
  07 finresp.html        - Financial Responsibility
  08 deductible.html     - Deductible
  09 treatment.html      - Consent for Treatment
  10 radiology.html      - Radiology Warning Statement
"""
import os

SRC = "/mnt/c/Users/Stric/MedicalCRM/design/page1.html"
DESIGN_DIR = "/mnt/c/Users/Stric/MedicalCRM/design"

with open(SRC, "r", encoding="utf-8") as f:
    src_lines = f.readlines()

WATERMARK_IMG = src_lines[245].strip()
HEADER_LOGO_IMG = src_lines[251].strip()
assert WATERMARK_IMG.startswith("<img "), "watermark not found"
assert HEADER_LOGO_IMG.startswith("<img "), "header logo not found"

# Shared CSS + header chrome (extracted to avoid repetition)
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
  .pager { display: flex; gap: 4px; flex-wrap: wrap; max-width: 720px; }
  .page-link {
    color: #c8d2e0; text-decoration: none;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    padding: 5px 9px; border-radius: 6px;
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
    font-size: 10px; line-height: 1.45;
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
    margin: 0; font-size: 15px; font-weight: 800;
    letter-spacing: -0.01em; color: #000;
    text-transform: uppercase;
    max-width: 600px;
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
    grid-template-columns: 2fr 1fr 1fr;
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
  .body p { margin: 0 0 8px 0; text-align: justify; }
  .body p strong { font-weight: 700; }
  .body .es-block { color: #444; font-size: 9.5px; margin-top: 4px; font-style: italic; }
  .body .divider {
    text-align: center; margin: 12px 0; font-size: 9px; color: #888;
    letter-spacing: 0.4em;
  }

  /* Radio choice rows (mutually exclusive options) */
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
  .choice input[type=radio]:checked ~ .choice-body { font-weight: 600; }
  .choice-body { flex: 1; line-height: 1.45; }
  .choice-body input[type=text], .choice-body textarea {
    margin-top: 4px;
    width: 100%; height: 22px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; padding: 1px 2px 3px;
    outline: none;
  }
  .choice-body textarea { height: 48px; resize: vertical; }
  .choice-body input:focus, .choice-body textarea:focus { background: #f3fafe; border-bottom-color: #41B6E6; }

  /* Generic check */
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

  /* PCI / warning callouts */
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

  /* Signature block */
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
    .page { box-shadow: none; margin: 0; width: 8.5in; min-height: 11in; }
    input, textarea {
      background: transparent !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .check input[type=checkbox]:checked, .choice input[type=radio]:checked {
      background: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .header, .accent-bar, .accent-rule, .warning, .sig-block, .ident-strip, .choice {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  }
  @page { size: Letter; margin: 0; }
"""

PAGES = [
    ("intake.html",      "01 Intake",      None),
    ("disclosure.html",  "02 Disclosure",  None),
    ("aob.html",         "03 AOB",         None),
    ("consent.html",     "04 Consent",     None),
    ("priv_ack.html",    "05 Privacy",     None),
    ("fraud.html",       "06 Fraud",       None),
    ("finresp.html",     "07 Fin. Resp.",  None),
    ("deductible.html",  "08 Deductible",  None),
    ("treatment.html",   "09 Treatment",   None),
    ("radiology.html",   "10 Radiology",   None),
]

def make_pager(active):
    parts = []
    for href, label, _ in PAGES:
        cls = "page-link active" if href == active else "page-link"
        parts.append(f'<a class="{cls}" href="{href}">{label}</a>')
    return f'<div class="pager">{"".join(parts)}</div>'

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

# ===== Identity strip helpers =====
def ident_strip(include_doa=False):
    extra = ''
    if include_doa:
        extra = '<div class="field"><label>Date of Accident <span class="es">/ Fecha del accidente</span></label><input type="date" name="date_of_accident"></div>'
        ident_grid_cols = "2fr 1fr 1fr 1fr"
    else:
        ident_grid_cols = "2fr 1fr 1fr"
    return f"""<div class="ident-strip" style="grid-template-columns:{ident_grid_cols}">
    <div class="field"><label>Patient Name <span class="es">/ Nombre</span></label><input type="text" name="patient_name"></div>
    <div class="field"><label>Date of Birth <span class="es">/ Fecha de nacimiento</span></label><input type="date" name="patient_dob"></div>
    <div class="field"><label>Phone <span class="es">/ Teléfono</span></label><input type="tel" name="patient_phone"></div>
    {extra}
  </div>"""

def sig_simple(prefix="patient"):
    return f"""<div class="sig-block">
    <div class="who">Patient / Guardian Signature</div>
    <div class="sig-row">
      <div class="sig-cell"><label>Patient's Name <span class="hint">Print</span></label><input type="text" name="{prefix}_name_print"></div>
      <div class="sig-cell signature"><label>Patient's Signature <span class="hint">If minor, parent/guardian</span></label><input type="text" name="{prefix}_signature"></div>
      <div class="sig-cell"><label>Date</label><input type="date" name="{prefix}_signed_date"></div>
    </div>
  </div>"""

# ===========================================================
# PAGE 05 - PRIVACY ACKNOWLEDGEMENT
# ===========================================================
priv_body = ident_strip() + """
  <div class="body">
    <p>I have received a copy of the Pro Injury Medical &amp; Rehabilitation <strong>Notice of Privacy Practices</strong>. The notice describes how my health information may be used or disclosed. I understand that I should read it carefully. I am aware that the notice may be changed at any time. I may obtain a revised copy of the Notice of Privacy Practices by calling the above facility or by requesting one at this facility.</p>
    <p class="es-block">He recibido una copia del Aviso de Prácticas de Privacidad de Pro Injury. El aviso describe cómo se puede usar o divulgar mi información médica. Entiendo que debo leerlo con cuidado, y que puede cambiar en cualquier momento. Puedo obtener una copia revisada llamando o solicitándola en este centro.</p>

    <div class="sig-block">
      <div class="who">Patient Signature</div>
      <div class="sig-row">
        <div class="sig-cell"><label>Patient's Name <span class="hint">Print</span></label><input type="text" name="patient_name_print"></div>
        <div class="sig-cell signature"><label>Patient's Signature</label><input type="text" name="patient_signature"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="patient_signed_date"></div>
      </div>
    </div>

    <p style="margin-top:14px;font-size:9.5px;"><em>As a representative of the above individual, I acknowledge receipt of the notice on his or her behalf. <span class="es-block" style="margin:0;display:inline">Como representante de la persona anterior, reconozco haber recibido este aviso en su nombre.</span></em></p>

    <div class="sig-block">
      <div class="who">Personal Representative (if applicable)</div>
      <div class="sig-row three-equal">
        <div class="sig-cell"><label>Name of Person <span class="hint">Print</span></label><input type="text" name="rep_name"></div>
        <div class="sig-cell"><label>Relationship</label><input type="text" name="rep_relationship"></div>
        <div class="sig-cell signature"><label>Signature</label><input type="text" name="rep_signature"></div>
      </div>
    </div>
  </div>
"""

# ===========================================================
# PAGE 06 - FRAUD STATEMENT
# ===========================================================
fraud_body = ident_strip(include_doa=True) + """
  <div class="body">
    <p style="font-weight:700;text-transform:uppercase;letter-spacing:0.04em;font-size:11px;">I attest that:</p>
    <ul style="margin:4px 0 8px 22px;padding:0;">
      <li>I was involved in a motor vehicle accident on the date of accident above and, as a result of said accident, I suffered personal bodily injury, pain and suffering, and I have independently and voluntarily sought medical care and treatment for such damages.</li>
      <li>I have performed the selection of medical doctors, hospital, or clinic individually, freely, and without duress, urging, or coercion.</li>
      <li>I have <strong>not</strong> been unlawfully or wrongly assisted or urged by any attorney, or any other person, to make a fraudulent or false civil damages claim.</li>
      <li>This personal injury claim is presented solely because of the bodily injuries truly suffered by me as a result of the motor vehicle accident.</li>
      <li>No one has conspired with me or on my behalf to induce, assist, or urge me to make a fraudulent civil action damages claim or to fraudulently violate Florida Law.</li>
      <li>For the benefit of any and all insurance companies involved, or other persons related to this accident, I am legitimately injured and truly suffering pain.</li>
      <li>I have read and understand the contents of this <strong>FRAUD STATEMENT</strong> and it expresses the truth and facts contained therein.</li>
    </ul>
    <p>I authorize this facility / institution / clinic to release this statement to anyone.</p>
    <p class="es-block">Doy fe de que estuve involucrado(a) en un accidente automovilístico, sufrí lesiones físicas reales, busqué tratamiento médico por voluntad propia, no he sido inducido(a) por nadie a hacer un reclamo fraudulento, y autorizo a este centro a divulgar esta declaración.</p>

    """ + sig_simple("fraud") + """
  </div>
"""

# ===========================================================
# PAGE 07 - FINANCIAL RESPONSIBILITY (Bilingual)
# ===========================================================
finresp_body = ident_strip() + """
  <div class="body">
    <p>I understand and am aware that, as a patient of Pro Injury Medical &amp; Rehabilitation, <strong>if my insurance coverage is not verified, benefits are not authorized by my insurance carrier, or a deductible is applied,</strong> I am responsible for all the charges incurred during my treatment and any balance not paid by my insurance company and owed to this medical center. This notice has been read, informed, and explained to me in detail.</p>

    <div class="divider">· · ·</div>

    <p style="font-weight:700;">Responsabilidad Financiera</p>
    <p>Yo entiendo y estoy consciente de que, como paciente de Pro Injury Medical &amp; Rehabilitation, <strong>si mi cobertura no es verificada, los beneficios no son autorizados por mi compañía de seguro, o si se aplica un deducible,</strong> soy responsable de todos los gastos incurridos durante mi tratamiento y de cualquier balance pendiente que se le deba a este centro médico. Este aviso fue leído, informado y explicado en detalle.</p>

    """ + sig_simple("finresp") + """
  </div>
"""

# ===========================================================
# PAGE 08 - DEDUCTIBLE (with PCI-safe credit card handling)
# ===========================================================
deductible_body = ident_strip() + """
  <div class="body">
    <p>If there is a deductible in your PIP policy, how would you prefer to pay for the services not covered by your insurance policy? Please choose <strong>one</strong>.</p>
    <p class="es-block">Si su póliza PIP tiene un deducible, ¿cómo prefiere pagar los servicios no cubiertos? Por favor elija <strong>una</strong> opción.</p>

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
          <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Cargar tarjeta de crédito</span>
          <div class="warning" style="margin:6px 0 0;">⚠ <strong>For security, do NOT write your card number on this paper form.</strong> A Pro Injury staff member will collect it directly through our secure payment terminal.<br>
          <span class="es-block" style="margin:2px 0 0">No escriba el número de su tarjeta en este formulario. Un miembro del personal lo procesará en nuestra terminal segura.</span></div>
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
          <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Envíe la factura a mi abogado</span>
          <input type="text" name="attorney_firm" placeholder="Law firm / Bufete">
          <input type="text" name="attorney_name" placeholder="Attorney name / Nombre del abogado">
          <input type="text" name="attorney_phone" placeholder="Phone / Teléfono">
        </div>
      </label>
      <label class="choice">
        <input type="radio" name="deductible_choice" value="hardship">
        <div class="choice-body">
          <strong>Request a financial hardship review</strong>
          <span class="es" style="opacity:.6;font-size:9px;margin-left:4px">/ Solicitar revisión por dificultad económica</span>
        </div>
      </label>
    </div>

    """ + sig_simple("deductible") + """
  </div>
"""

# ===========================================================
# PAGE 09 - CONSENT FOR TREATMENT (Bilingual)
# ===========================================================
treatment_body = ident_strip() + """
  <div class="body">
    <p>The undersigned has been informed of the treatment considered necessary for the patient whose name appears above, and the treatment and procedures will be performed by physicians and employees of Pro Injury Medical &amp; Rehabilitation.</p>
    <p>Authorization is hereby granted for such treatment, procedures, and the administration of anesthetics, medications, or other therapies that may be deemed necessary.</p>
    <p>I consent — for myself or on behalf of the patient — to the selection and assignment of physician, and I agree to make arrangements with him or her for obtaining a complete diagnosis and continuation of treatment as needed.</p>
    <p>I certify that I have read the above authorization and understand it. I also certify that no guarantee or assurance has been made to me as to the results that may be obtained by this treatment.</p>

    <div class="divider">· · ·</div>

    <p style="font-weight:700;">Consentimiento para Tratamiento</p>
    <p>El que suscribe ha sido informado del tratamiento que se considera necesario para el paciente cuyo nombre aparece arriba, y dicho tratamiento será realizado por los doctores y el personal de Pro Injury Medical &amp; Rehabilitation.</p>
    <p>Por este medio se autoriza dicho tratamiento, procedimientos y la administración de anestésicos, medicamentos u otras terapias que sean necesarias.</p>
    <p>Consiento — por mí mismo(a) o en lugar del paciente — la designación del médico y acuerdo hacer arreglos con él o ella para obtener un diagnóstico completo y la continuación del tratamiento.</p>
    <p>Certifico que he leído y comprendido la autorización anterior, y que no se me ha dado ninguna garantía sobre los resultados del tratamiento.</p>

    <p style="font-style:italic;font-size:9px;opacity:.7;margin-top:8px;">* All authorizations must be signed by the patient or an authorized person in the case of a minor or when the patient is physically or mentally incapacitated. /<br>
    Toda autorización debe ser firmada por el paciente o por una persona autorizada en caso de menores o incapacidad física o mental.</p>

    """ + sig_simple("treatment") + """
  </div>
"""

# ===========================================================
# PAGE 10 - RADIOLOGY WARNING (Female patients - pregnancy)
# ===========================================================
radiology_body = ident_strip() + """
  <div class="body">
    <p>The following statement is to be read and signed by <strong>all female patients of child-bearing age</strong> who are scheduled for diagnostic X-rays. X-rays taken during pregnancy may be extremely dangerous to the unborn child unless adequate precautions are applied during the procedure. Therefore, you are asked to inform the X-ray technician if there is any possibility that you are pregnant. Please sign the statement below only if you are <strong>not</strong> pregnant.</p>
    <p class="es-block">La siguiente declaración debe ser leída y firmada por todas las pacientes mujeres en edad fértil que serán sometidas a estudios de rayos-X. Los rayos-X tomados durante el embarazo pueden ser extremadamente peligrosos para el bebé. Informe al técnico si existe alguna posibilidad de embarazo. Firme solo si <strong>NO</strong> está embarazada.</p>

    <div class="warning" style="margin:14px 0;">
      <strong>STATEMENT / DECLARACIÓN:</strong><br>
      I certify, to the best of my knowledge, that I am <strong>not pregnant</strong> at this time, and I authorize the X-rays to be taken of myself.
      <div class="es-block" style="margin:4px 0 0;">Certifico, a mi mejor saber, que <strong>no estoy embarazada</strong> en este momento, y autorizo a que se me realicen los rayos-X necesarios.</div>
    </div>

    <div class="check-row" style="margin-top:8px;">
      <label class="check"><input type="checkbox" name="not_pregnant_attest" value="yes"> I attest that I am not pregnant <span class="es">/ Confirmo que no estoy embarazada</span></label>
      <label class="check"><input type="checkbox" name="not_applicable" value="yes"> Not applicable (male or post-menopausal) <span class="es">/ No aplica</span></label>
    </div>

    """ + sig_simple("radiology") + """
  </div>
"""

# Build all six pages
pages_to_build = [
    ("priv_ack.html",    5,  "Acknowledgement of Receipt of Notice of Privacy Practices", "Acuse de Recibo del Aviso de Prácticas de Privacidad", priv_body,       "proInjury.priv_ack.v1"),
    ("fraud.html",       6,  "Fraud Statement", "Declaración Anti-Fraude", fraud_body, "proInjury.fraud.v1"),
    ("finresp.html",     7,  "Financial Responsibility", "Responsabilidad Financiera", finresp_body, "proInjury.finresp.v1"),
    ("deductible.html",  8,  "Deductible Payment Method", "Método de Pago del Deducible", deductible_body, "proInjury.deductible.v1"),
    ("treatment.html",   9,  "Consent for Treatment", "Consentimiento para Tratamiento", treatment_body, "proInjury.treatment.v1"),
    ("radiology.html",   10, "Radiology Warning Statement", "Advertencia de Radiología", radiology_body, "proInjury.radiology.v1"),
]

TOTAL = 12
for filename, num, t_en, t_es, body, store in pages_to_build:
    html = page_chrome(t_en, t_es, num, TOTAL, body, store, filename)
    out_path = os.path.join(DESIGN_DIR, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {out_path} ({os.path.getsize(out_path)} bytes)")
