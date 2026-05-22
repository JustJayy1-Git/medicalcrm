#!/usr/bin/env python3
"""Build page 3 - Assignment of Insurance Benefits / Release / Demand."""
import os

SRC = "/mnt/c/Users/Stric/MedicalCRM/design/page1.html"
OUT = "/mnt/c/Users/Stric/MedicalCRM/design/aob.html"

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
<title>Pro Injury — Assignment of Insurance Benefits · CRM</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #1a1d24; }

  /* Toolbar */
  .toolbar {
    position: sticky; top: 0; z-index: 100;
    background: #0c0f15; color: #fff;
    padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; border-bottom: 1px solid #2a2f3a;
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

  /* US Letter @ ~96dpi */
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

  /* Page title */
  .page-title {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 24px 6px;
    border-bottom: 1px solid #e0e0e0;
  }
  .page-title h1 {
    margin: 0; font-size: 16px; font-weight: 800;
    letter-spacing: -0.01em; color: #000;
    text-transform: uppercase;
  }
  .page-title .pagenum {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
  }
  .page-title .pagenum .badge {
    background: #000; color: #fff; padding: 3px 9px; border-radius: 999px;
    font-weight: 700; letter-spacing: 0.08em;
  }
  .page-title .pagenum .badge .of { opacity: 0.55; margin-left: 2px; }

  /* Body */
  .body { padding: 12px 24px 14px; }
  .body p { margin: 0 0 7px 0; text-align: justify; }
  .body p .label {
    font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .body p strong { font-weight: 700; }

  /* CAUTION call-out */
  .caution {
    margin: 10px 0;
    background: #fef6ef;
    border-left: 3px solid #DB3EB1;
    padding: 8px 12px;
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.45;
    color: #000;
  }

  /* Signature block */
  .sig-block {
    margin-top: 10px;
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
  .sig-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .sig-row.single { grid-template-columns: 1fr; }
  .sig-row.two-one { grid-template-columns: 2fr 1fr; }
  .sig-cell label {
    display: block; font-size: 7.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #000;
  }
  .sig-cell label .hint {
    font-weight: 400; opacity: .55; letter-spacing: 0;
    text-transform: none; margin-left: 4px;
  }
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
    .sig-cell input, .footer .initials input {
      background: transparent !important; border-bottom: 1.5px solid #000 !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .header, .accent-bar, .accent-rule, .caution, .sig-block {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  }
  @page { size: Letter; margin: 0; }
</style>
</head>
<body>

<div class="toolbar">
  <div class="brand">PRO INJURY · <span class="accent">Assignment of Benefits</span></div>
  <div class="pager">
    <a class="page-link" href="intake.html">01 Intake</a>
    <a class="page-link" href="disclosure.html">02 Disclosure</a>
    <a class="page-link active" href="aob.html">03 AOB</a>
    <a class="page-link" href="consent.html">04 Consent</a>
    <a class="page-link" href="priv_ack.html">05 Privacy</a>
    <a class="page-link" href="fraud.html">06 Fraud</a>
    <a class="page-link" href="finresp.html">07 Fin. Resp.</a>
    <a class="page-link" href="deductible.html">08 Deductible</a>
    <a class="page-link" href="treatment.html">09 Treatment</a>
    <a class="page-link" href="radiology.html">10 Radiology →</a>
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

<form id="aobForm" autocomplete="off" onsubmit="event.preventDefault()">

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

  <!-- PAGE TITLE -->
  <div class="page-title">
    <h1>Assignment of Insurance Benefits, Release &amp; Demand</h1>
    <div class="pagenum"><span>Page</span><span class="badge">03<span class="of"> / 12</span></span></div>
  </div>

  <div class="body">

    <p>I, the undersigned patient/insured knowingly, voluntarily and intentionally assign the rights and benefits of my automobile insurance, also known as Personal Injury Protection (hereinafter "<strong>PIP</strong>") and Medical Payments policy of insurance to the above healthcare provider (hereinafter "<strong>PRO INJURY</strong>"). I understand it is the intention of PRO INJURY to accept this assignment of benefits in lieu of demanding payment at the time that services are rendered and that this document will allow PRO INJURY to file suit against an insurer for payment of the insurance benefits. This assignment of benefits includes overdue interest payments and any potential claim for bad faith. If the insurer disputes the validity of this assignment of benefits, then the insurer is instructed to notify PRO INJURY in writing within <strong>five (5) days</strong> of receipt of this document or it waives that defense. In addition, the insurer is directed to pay PRO INJURY directly without including my name on the check.</p>

    <p>The insurer is directed by PRO INJURY and the undersigned to issue any checks in partial settlement of a claim that contain or are accompanied by language releasing the insurer or its insured/patient from liability. The insured and PRO INJURY hereby <strong>contest and object</strong> to any reductions or partial payments. Any partial or reduced payment, regardless of the accompanying language, issued by the insurer and deposited by PRO INJURY shall be done so <strong>under protest</strong>, at the risk of the insurer, and the deposit shall not be deemed a waiver, accord, satisfaction, discharge, settlement or agreement by PRO INJURY to accept a reduced amount as payment in full. The insurer is hereby placed on notice that PRO INJURY reserves the right to seek the full amount of the bills submitted.</p>

    <p>If the insurer schedules an examination under oath (hereinafter "<strong>EUO</strong>"), the insurer is hereby <strong>INSTRUCTED</strong> to send a copy of said notification to PRO INJURY. PRO INJURY or its attorneys are expressly authorized to appear at any EUO or IME set by the insurer. The assignment applies to both past and future medical expenses and is valid even if undated. A photocopy of this assignment is to be considered as valid as the original. I agree to pay any applicable deductible, co-payments, for services rendered after the policy of insurance exhausts and for any other services unrelated to the automobile accident.</p>

    <p><span class="label">Release of Information:</span> I hereby authorize PRO INJURY to: furnish my insurer, my other medical providers, and my attorney via mail, fax, or email, with any and all information that is contained in my medical records; to obtain insurance coverage information (declaration sheet &amp; policy of insurance) in writing and telephonically from the insurer; request from any insurer all explanation of benefits (EOBs) for all providers and non-redacted PIP payout sheets; obtain any written and verbal statements the patient or anyone else provided to the insurer (including EUOs); obtain copies of the entire claim file and all medical records, including but not limited to, documents, reports, scans, notes, bills, opinions, X-rays, IMEs and MRIs, from any other medical provider or any insurer. PRO INJURY is permitted to produce my medical records to its attorney in connection with any pending lawsuits. The insurer is directed to keep the patient's medical records from PRO INJURY private and confidential and the insurer is not authorized to provide these medical records to anyone without the patient's prior express written authorization.</p>

    <p><span class="label">Demand:</span> Demand is hereby made for the insurer to pay all bills within <strong>30 days</strong> without reductions and to mail the latest non-redacted PIP payout sheet and the insurance coverage declaration sheet to the above provider within <strong>15 days</strong>. The insurer is directed to pay the bills in the order they are received. However, if a bill from PRO INJURY and a claim from anyone else is received by the insurer on the same day, the insurer is directed to not apply PRO INJURY's bill to the deductible (if applicable), and to pay PRO INJURY first. In the event PRO INJURY's medical bills are disputed or reduced by the insurer for any reason, the undersigned hereby instructs the insurer to set aside any amount disputed (i.e. place the money in escrow), and not pay the disputed amount to anyone or any entity, including myself, until the dispute is resolved. In addition, the insurer is instructed to inform PRO INJURY in writing of any dispute.</p>

    <p><span class="label">Certification:</span> I certify that I have read and agree to the above; I have not been solicited or promised anything in exchange for my treatment; I have not received any promises or guarantees from anyone as to the results that may be obtained by any treatment or service; and agree that PRO INJURY's prices for medical services, treatment and supplies are reasonable, usual and customary.</p>

    <div class="caution">
      ⚠ Caution: Please read before signing and ask to view our charges. If you don't understand this document, please ask us to explain it. If you sign below, we assume you understood it and agreed to the above terms.
    </div>

    <!-- Signature block -->
    <div class="sig-block">
      <div class="who">Patient / Insured Signature</div>
      <div class="sig-row two-one">
        <div class="sig-cell"><label>Patient's Name <span class="hint">Please Print</span></label><input type="text" name="patient_name"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="signed_date"></div>
      </div>
      <div class="sig-row single" style="margin-top:10px;">
        <div class="sig-cell signature"><label>Patient's Signature <span class="hint">If a minor, then signature of parent / guardian</span></label><input type="text" name="patient_signature"></div>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="accent-bar"></div>
  <div class="footer">
    <div class="initials"><span>Patient Initials</span><input name="patient_initials_p3" type="text" maxlength="4"></div>
    <div class="right">Pro Injury Medical &amp; Rehabilitation · Rev. 2026.05 · Page 03 of 12 · CRM / Digital</div>
  </div>
</div>

</form>

<script>
(function(){
  const form = document.getElementById('aobForm');
  const indicator = document.getElementById('savedIndicator');
  const STORE_KEY = 'proInjury.aob.v1';
  let saveTimer = null;

  function setIndicator(state){
    if(state==='saving'){ indicator.textContent = '●  saving…'; indicator.style.color = '#41B6E6'; }
    else if(state==='saved'){ indicator.textContent = '●  saved locally'; indicator.style.color = '#7fdf7f'; }
    else { indicator.textContent = '●  unsaved'; indicator.style.color = '#c8d2e0'; }
  }
  function collect(){
    const data = {};
    for(const el of form.querySelectorAll('[name]')){
      if(el.type === 'checkbox') data[el.name] = el.checked;
      else data[el.name] = el.value;
    }
    return data;
  }
  function apply(data){
    if(!data) return;
    for(const el of form.querySelectorAll('[name]')){
      const v = data[el.name]; if(v === undefined) continue;
      if(el.type === 'checkbox') el.checked = !!v;
      else el.value = v ?? '';
    }
  }
  function save(){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(collect())); setIndicator('saved'); }
    catch(e){ console.error(e); }
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
      // Auto-fill patient name from intake if blank
      const pname = form.querySelector('[name=patient_name]');
      if(pname && !pname.value){
        const intake = JSON.parse(localStorage.getItem('proInjury.intake.v1') || '{}');
        if(intake.patient_name) pname.value = intake.patient_name;
      }
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
    const name = ((data.patient_name || 'patient') + '_aob.json').replace(/\s+/g,'_');
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

out = (HTML
       .replace("__WATERMARK__", WATERMARK_IMG)
       .replace("__HEADER_LOGO__", HEADER_LOGO_IMG))

with open(OUT, "w", encoding="utf-8") as f:
    f.write(out)
print(f"wrote {OUT} ({os.path.getsize(OUT)} bytes)")
