#!/usr/bin/env python3
"""Build the working CRM intake form. ONE PAGE, mirroring the PDF exactly."""
import os, sys

SRC = "/mnt/c/Users/Stric/MedicalCRM/design/page1.html"
OUT = "/mnt/c/Users/Stric/MedicalCRM/design/intake.html"

with open(SRC, "r", encoding="utf-8") as f:
    src_lines = f.readlines()

WATERMARK_IMG = src_lines[245].strip()
HEADER_LOGO_IMG = src_lines[251].strip()
assert WATERMARK_IMG.startswith("<img "), "watermark not found"
assert HEADER_LOGO_IMG.startswith("<img "), "header logo not found"

HTML = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pro Injury — Patient Intake · CRM Working Form</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #1a1d24; }

  /* ========= Toolbar (screen only) ========= */
  .toolbar {
    position: sticky; top: 0; z-index: 100;
    background: #0c0f15; color: #fff;
    padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid #2a2f3a;
  }
  .toolbar .brand {
    font-family: "Times New Roman", serif;
    font-size: 16px; font-weight: 700; letter-spacing: 0.04em;
  }
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
  .pager { display: flex; gap: 6px; }
  .page-link {
    color: #c8d2e0; text-decoration: none;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 6px 12px; border-radius: 6px;
    border: 1px solid #2a2f3a;
    transition: all 0.15s;
  }
  .page-link:hover { background: #1a1f2a; color: #fff; border-color: #3a4150; }
  .page-link.active {
    background: linear-gradient(135deg, #41B6E6 0%, #DB3EB1 100%);
    color: #fff; border-color: transparent;
  }

  /* US Letter @ ~96dpi = 816 x 1056 */
  .page {
    width: 816px; min-height: 1056px;
    margin: 24px auto;
    background: #fff; color: #000;
    font-family: "Inter", -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 10px;          /* tighter */
    line-height: 1.3;
    position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,0.45);
    overflow: hidden;
  }

  /* Watermark */
  .watermark {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 0; opacity: 0.06;
  }
  .watermark img { width: 520px; height: auto; }
  .page > *:not(.watermark) { position: relative; z-index: 1; }

  /* Header */
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

  /* Meta strip */
  .meta-strip {
    display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0; background: #fafafa; border-bottom: 1px solid #d0d0d0;
  }
  .meta-cell { padding: 8px 12px; border-right: 1px solid #d0d0d0; }
  .meta-cell:last-child { border-right: 0; }
  .meta-cell .lbl {
    font-size: 7.5px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #000;
  }
  .meta-cell .lbl .es { font-weight: 400; opacity: .55; text-transform: none; letter-spacing: 0; }
  .meta-cell input {
    margin-top: 4px; width: 100%; height: 18px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; color: #000;
    padding: 0 2px 2px; outline: none;
  }
  .meta-cell input:focus { background: #f3fafe; border-bottom-color: #41B6E6; }
  .meta-cell select {
    margin-top: 4px; width: 100%; height: 22px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; color: #000;
    padding: 0 2px 2px; outline: none; cursor: pointer;
  }
  .meta-cell select:focus { background: #f3fafe; border-bottom-color: #41B6E6; }

  /* Page title */
  .page-title {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 24px 4px;
  }
  .page-title h1 {
    margin: 0; font-size: 15px; font-weight: 800;
    letter-spacing: -0.01em; color: #000;
  }
  .page-title .es { font-weight: 400; opacity: .55; font-size: 11px; margin-left: 6px; }
  .page-title .pagenum {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
  }
  .page-title .pagenum .badge {
    background: #000; color: #fff; padding: 3px 9px; border-radius: 999px;
    font-weight: 700; letter-spacing: 0.08em;
  }
  .page-title .pagenum .badge .of { opacity: 0.55; margin-left: 2px; }

  /* Section */
  .body { padding: 0 24px 14px; }
  .section { margin-top: 9px; }
  .section-head {
    display: flex; align-items: center; gap: 8px; margin-bottom: 5px;
  }
  .section-num {
    font-size: 8px; font-weight: 800; letter-spacing: 0.12em;
    color: #fff; padding: 2px 7px; border-radius: 3px;
    background: linear-gradient(135deg, #41B6E6 0%, #DB3EB1 100%);
  }
  .section-title {
    margin: 0; font-size: 11.5px; font-weight: 800;
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

  .row { display: grid; gap: 5px 10px; margin-bottom: 4px; }
  .r2 { grid-template-columns: 1fr 1fr; }
  .r3 { grid-template-columns: 1fr 1fr 1fr; }
  .r4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
  .r5 { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
  .r6 { grid-template-columns: repeat(6, 1fr); }
  .r-2-1-1 { grid-template-columns: 2fr 1fr 1fr; }
  .r-3-1 { grid-template-columns: 3fr 1fr; }
  .r-1-2 { grid-template-columns: 1fr 2fr; }
  .r-2-1 { grid-template-columns: 2fr 1fr; }
  .span2 { grid-column: span 2; }
  .span3 { grid-column: span 3; }

  .field label.lbl {
    display: block; font-size: 7.5px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; color: #000;
    line-height: 1.15;
  }
  .field .es {
    font-weight: 400; opacity: 0.55; margin-left: 4px;
    letter-spacing: 0; text-transform: none;
  }

  .field input[type=text],
  .field input[type=email],
  .field input[type=tel],
  .field input[type=date],
  .field input[type=number],
  .field input[type=time],
  .field textarea {
    margin-top: 2px; width: 100%; height: 20px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; color: #000;
    padding: 1px 2px 3px; outline: none; border-radius: 0;
  }
  .field input:focus, .field textarea:focus {
    background: #f3fafe; border-bottom-color: #41B6E6;
  }
  .field input[type=date] {
    min-height: 28px;
    cursor: pointer;
  }
  .field textarea {
    height: 38px; line-height: 1.35; resize: vertical;
  }

  /* Pill radio */
  .pill-row { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 3px; }
  .pill-row input { position: absolute; opacity: 0; pointer-events: none; }
  .pill {
    font-size: 9px; padding: 2px 8px; border-radius: 999px;
    border: 1.3px solid #000; background: #fff; color: #000;
    font-weight: 600; cursor: pointer; user-select: none;
    display: inline-flex; align-items: center; line-height: 1.2;
  }
  .pill-row input:checked + .pill { background: #000; color: #fff; }
  .pill-row input:focus-visible + .pill { outline: 2px solid #41B6E6; outline-offset: 1px; }

  /* Yes/No micro pill */
  .yn { display: inline-flex; gap: 3px; margin-top: 3px; }
  .yn input { display: none; }
  .yn label {
    font-size: 9px; padding: 2px 9px;
    border: 1.3px solid #000; border-radius: 999px;
    cursor: pointer; font-weight: 700; background: #fff; color: #000;
  }
  .yn input:checked + label { background: #000; color: #fff; }

  /* Footer */
  .accent-bar {
    height: 5px;
    background: linear-gradient(90deg, #000 0%, #41B6E6 50%, #DB3EB1 100%);
    margin-top: 10px;
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
  .footer .initials input:focus { background: #f3fafe; border-bottom-color: #41B6E6; }
  .footer .right { opacity: 0.7; }

  /* PRINT */
  @media print {
    html, body { background: #fff; }
    .toolbar { display: none !important; }
    .page { box-shadow: none; margin: 0; width: 8.5in; min-height: 11in; }
    .field input, .field textarea, .meta-cell input, .footer .initials input {
      background: transparent !important; border-bottom: 1.5px solid #000 !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .pill-row input:checked + .pill,
    .yn input:checked + label {
      background: #000 !important; color: #fff !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .header, .section-num, .accent-bar, .accent-rule {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  }
  @page { size: Letter; margin: 0; }
</style>
</head>
<body>

<!-- ============ TOOLBAR ============ -->
<div class="toolbar">
  <div class="brand">PRO INJURY · <span class="accent">CRM Intake</span></div>
  <div class="pager">
    <a class="page-link active" href="intake.html">01 Intake</a>
    <a class="page-link" href="disclosure.html">02 PIP Disclosure</a>
    <a class="page-link" href="aob.html">03 AOB</a>
    <a class="page-link" href="hipaa.html">04 HIPAA Consent</a>
    <a class="page-link" href="fraud.html">05 Fraud</a>
    <a class="page-link" href="financial.html">06 Financial</a>
    <a class="page-link" href="treatment.html">07 Treatment</a>
    <a class="page-link" href="records.html">08 Records →</a>
  </div>
  <div class="actions">
    <span class="saved-indicator" id="savedIndicator">●  unsaved</span>
    <button class="btn ghost" type="button" onclick="resetForm()">Reset</button>
    <button class="btn ghost" type="button" onclick="exportJSON()">Export JSON</button>
    <button class="btn ghost" type="button" onclick="document.getElementById('importFile').click()">Import JSON</button>
    <input type="file" id="importFile" accept="application/json" style="display:none" onchange="importJSON(event)">
    <button class="btn primary" type="button" onclick="window.print()">Print</button>
  </div>
</div>

<form id="intakeForm" autocomplete="off" onsubmit="event.preventDefault()">

<div class="page">
  <div class="watermark">__WATERMARK__</div>

  <!-- HEADER -->
  <div class="header">
    <div class="header-logo">__HEADER_LOGO__</div>
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

  <!-- META STRIP -->
  <div class="meta-strip">
    <div class="meta-cell"><div class="lbl">Today's Date <span class="es">/ Fecha de hoy</span></div><input name="meta_todays_date" type="date"></div>
    <div class="meta-cell"><div class="lbl">Date of Accident <span class="es">/ Fecha del accidente</span></div><input name="meta_date_of_accident" type="date"></div>
    <div class="meta-cell"><div class="lbl">Referred By <span class="es">/ Referido por</span></div><input name="meta_referred_by" type="text"></div>
    <div class="meta-cell"><div class="lbl">Type of Accident <span class="es">/ Tipo de accidente</span></div><select name="meta_type_of_accident"><option value="">Select type…</option><option value="motor_vehicle_accident">Motor Vehicle Accident</option><option value="slip_and_fall">Slip and Fall</option></select></div>
  </div>

  <!-- PAGE TITLE -->
  <div class="page-title">
    <h1>PATIENT INTAKE <span class="es">/ Admisión del Paciente</span></h1>
    <div class="pagenum"><span>Page</span><span class="badge">01<span class="of"> / 08</span></span></div>
  </div>

  <div class="body">

__SECTIONS__

  </div>

  <div class="accent-bar"></div>
  <div class="footer">
    <div class="initials"><span>Patient Initials</span><input name="patient_initials" type="text" maxlength="4"></div>
    <div class="right">Pro Injury Medical &amp; Rehabilitation · Rev. 2026.05 · Page 01 of 08 · CRM / Digital</div>
  </div>
</div>

</form>

<script>
(function(){
  const form = document.getElementById('intakeForm');
  const indicator = document.getElementById('savedIndicator');
  const STORE_KEY = 'proInjury.intake.v1';
  let saveTimer = null;

  function setIndicator(state){
    if(state==='saving'){ indicator.textContent = '●  saving…'; indicator.style.color = '#41B6E6'; }
    else if(state==='saved'){ indicator.textContent = '●  saved locally'; indicator.style.color = '#7fdf7f'; }
    else { indicator.textContent = '●  unsaved'; indicator.style.color = '#c8d2e0'; }
  }
  function collect(){
    const data = {};
    for(const el of form.querySelectorAll('[name]')){
      const name = el.name;
      if(el.type === 'checkbox'){
        if(!(name in data)) data[name] = [];
        if(el.checked) data[name].push(el.value);
      } else if(el.type === 'radio'){
        if(el.checked) data[name] = el.value;
        else if(!(name in data)) data[name] = '';
      } else {
        data[name] = el.value;
      }
    }
    return data;
  }
  function apply(data){
    if(!data) return;
    for(const el of form.querySelectorAll('[name]')){
      const v = data[el.name];
      if(v === undefined) continue;
      if(el.type === 'checkbox'){
        if(Array.isArray(v)) el.checked = v.includes(el.value);
        else el.checked = (v === el.value);
      } else if(el.type === 'radio'){
        el.checked = (v === el.value);
      } else {
        el.value = v ?? '';
      }
    }
  }
  function save(){
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(collect()));
      setIndicator('saved');
    } catch(e){ console.error(e); }
  }
  function debounceSave(){
    setIndicator('saving');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
  }
  function load(){
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if(raw){ apply(JSON.parse(raw)); setIndicator('saved'); }
    } catch(e){ console.error(e); }
  }
  window.resetForm = function(){
    if(!confirm('Clear all fields? This cannot be undone.')) return;
    form.reset();
    localStorage.removeItem(STORE_KEY);
    setIndicator('unsaved');
  };
  window.exportJSON = function(){
    const blob = new Blob([JSON.stringify(collect(), null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    const data = collect();
    const name = ((data.patient_name || 'patient') + '_intake.json').replace(/\s+/g,'_');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    URL.revokeObjectURL(a.href);
  };
  window.importJSON = function(ev){
    const file = ev.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = () => { try { apply(JSON.parse(r.result)); save(); } catch(e){ alert('Invalid JSON'); } };
    r.readAsText(file);
  };

  form.addEventListener('input', debounceSave);
  form.addEventListener('change', debounceSave);

  load();
})();
</script>

</body>
</html>
"""

# ===== Helpers =====
def section(num, title_en, title_es, body):
    return f"""
    <div class="section">
      <div class="section-head">
        <span class="section-num">{num}</span>
        <h2 class="section-title">{title_en} <span class="es">/ {title_es}</span></h2>
        <div class="section-rule"></div>
      </div>
      {body}
    </div>"""

def tf(name, en, es=None, kind="text", cls=""):
    es_html = f'<span class="es">{es}</span>' if es else ""
    return f'<div class="field {cls}"><label class="lbl">{en} {es_html}</label><input type="{kind}" name="{name}"></div>'

def ta(name, en, es=None, rows=2, cls=""):
    es_html = f'<span class="es">{es}</span>' if es else ""
    return f'<div class="field {cls}"><label class="lbl">{en} {es_html}</label><textarea name="{name}" rows="{rows}"></textarea></div>'

def pill_radio(name, en, es, options, cls=""):
    es_html = f'<span class="es">{es}</span>' if es else ""
    pills = ""
    for i,(v, le, ls) in enumerate(options):
        pid = f"{name}_{i}"
        ls_html = f' <span class="es">{ls}</span>' if ls else ""
        pills += f'<input type="radio" name="{name}" id="{pid}" value="{v}"><label class="pill" for="{pid}">{le}{ls_html}</label>'
    return f'<div class="field {cls}"><label class="lbl">{en} {es_html}</label><div class="pill-row">{pills}</div></div>'

def yn(name, en, es, cls=""):
    es_html = f'<span class="es">{es}</span>' if es else ""
    return f'''<div class="field {cls}"><label class="lbl">{en} {es_html}</label>
      <div class="yn">
        <input type="radio" name="{name}" id="{name}_y" value="yes"><label for="{name}_y">Yes</label>
        <input type="radio" name="{name}" id="{name}_n" value="no"><label for="{name}_n">No</label>
      </div></div>'''

def row(cls, *fields):
    return f'<div class="row {cls}">{"".join(fields)}</div>'

# ============ SECTIONS — mirror PDF exactly ============

# 01 Language & Contact (top of original)
s01 = section("01", "Language &amp; Contact", "Idioma y Contacto",
    row("r2",
        pill_radio("language","Language Preferred","Idioma preferido",
            [("english","English",None),("spanish","Spanish",None),("creole","Creole",None)]),
        tf("email","E-Mail","Correo","email"),
    )
)

# 02 Personal Information
s02 = section("02", "Personal Information", "Información Personal",
    row("r-2-1",
        tf("patient_name","Name","Nombre"),
        pill_radio("marital","Marital Status","Estado civil",
            [("single","Single",None),("married","Married",None),("divorced","Divorced",None)]),
    )
    + row("r4",
        tf("addr_street","Address","Dirección"),
        tf("addr_city","City","Ciudad"),
        tf("addr_state","State","Estado"),
        tf("addr_zip","ZIP","CP"),
    )
    + row("r4",
        pill_radio("gender","Gender","Género",
            [("female","Female",None),("male","Male",None)]),
        tf("phone_home","Home #","Casa","tel"),
        tf("phone_cell","Cell #","Celular","tel"),
        pill_radio("client_role","Client","Cliente",
            [("driver","Driver","Conductor"),("passenger","Passenger","Pasajero")]),
    )
    + row("r2",
        tf("dob","Date of Birth","Fecha de nacimiento","date"),
        tf("emergency_contact","Emergency Contact","Contacto de emergencia"),
    )
)

# (Employment section removed)
s03 = ""

# 03 Emergency Response
s04 = section("03", "Emergency Response", "Respuesta de Emergencia",
    row("r-1-2",
        yn("rescue","Rescue","Rescate"),
        '<div></div>',
    )
    + row("r-1-2",
        yn("hospital","Hospital","Hospital"),
        tf("hospital_name","If Yes, Hospital Name","Si sí, nombre"),
    )
)

# 04 Personal Auto Insurance
s05 = section("04", "Personal Auto Insurance", "Seguro de auto personal",
    row("r2",
        tf("pip_carrier","Insurance Carrier","Aseguradora"),
        tf("pip_policy","Policy Number","# póliza"),
    )
    + row("r2",
        tf("pip_claim","Claim Number","# reclamo"),
        tf("pip_adjuster","Adjuster","Ajustador"),
    )
)

# (3rd Party Insurance section removed)
s06 = ""

# 05 Accident Details
s07 = section("05", "Accident Details", "Detalles del Accidente",
    tf("acc_crash_report","Crash Report #","# reporte")
    + ta("acc_summary","Brief Summary of Accident","Resumen breve", rows=2)
)

# 06 Medical History
s08 = section("06", "Medical History", "Historia Médica",
    row("r3",
        tf("inj_initial","Initial Injuries / Complaints","Lesiones / quejas iniciales"),
        tf("acc_prior_surgeries","Prior Surgeries","Cirugías previas"),
        tf("inj_treating_facility","Treating Facility Name","Centro de tratamiento"),
    )
)

all_sections = s01 + s02 + s03 + s04 + s05 + s06 + s07 + s08

out = (HTML
       .replace("__WATERMARK__", WATERMARK_IMG)
       .replace("__HEADER_LOGO__", HEADER_LOGO_IMG)
       .replace("__SECTIONS__", all_sections))

with open(OUT, "w", encoding="utf-8") as f:
    f.write(out)
print(f"wrote {OUT} ({os.path.getsize(OUT)} bytes)")
