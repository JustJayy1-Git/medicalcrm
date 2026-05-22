#!/usr/bin/env python3
"""Build page 2 - Standard Disclosure & Acknowledgement (Florida PIP).
Uses the same template as intake.html for visual consistency.
"""
import os

SRC = "/mnt/c/Users/Stric/MedicalCRM/design/page1.html"
OUT = "/mnt/c/Users/Stric/MedicalCRM/design/disclosure.html"

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
<title>Pro Injury — Standard Disclosure &amp; Acknowledgement · CRM</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #1a1d24; }

  /* Toolbar (screen only) */
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
    font-size: 10px; line-height: 1.4;
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

  /* Authority bar (the gov't body that issues this form) */
  .authority {
    background: #fafafa; border-bottom: 1px solid #d0d0d0;
    padding: 8px 24px; text-align: center;
  }
  .authority .who {
    font-size: 9.5px; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: #000;
  }
  .authority .what {
    font-size: 8.5px; color: #595959; letter-spacing: 0.1em;
    text-transform: uppercase; margin-top: 2px;
  }

  /* Page title */
  .page-title {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 24px 6px;
  }
  .page-title h1 {
    margin: 0; font-size: 15px; font-weight: 800;
    letter-spacing: -0.01em; color: #000;
  }
  .page-title .subtitle {
    font-weight: 400; opacity: .65; font-size: 11px; margin-left: 6px;
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
  .body { padding: 0 24px 14px; }
  .preamble {
    margin-top: 6px;
    font-size: 10.5px;
    font-weight: 600;
    color: #000;
  }

  /* Section */
  .section { margin-top: 10px; }
  .section-head {
    display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
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
  .section-rule {
    flex: 1; height: 1.2px;
    background: linear-gradient(90deg, #000 0%, transparent 100%);
    margin-left: 6px; opacity: 0.85;
  }

  /* Numbered list (1-5) */
  ol.affirm {
    list-style: none; padding: 0; margin: 0;
    counter-reset: aff;
  }
  ol.affirm > li {
    counter-increment: aff;
    position: relative;
    padding: 4px 0 4px 28px;
    font-size: 10px;
    line-height: 1.5;
  }
  ol.affirm > li::before {
    content: counter(aff);
    position: absolute; left: 0; top: 4px;
    width: 19px; height: 19px;
    background: linear-gradient(135deg, #41B6E6 0%, #DB3EB1 100%);
    color: #fff; font-weight: 800; font-size: 9.5px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    letter-spacing: 0;
  }
  /* Lettered list (A-D) */
  ol.affirm-alpha {
    list-style: none; padding: 0; margin: 0;
    counter-reset: aff2;
  }
  ol.affirm-alpha > li {
    counter-increment: aff2;
    position: relative;
    padding: 4px 0 4px 28px;
    font-size: 10px;
    line-height: 1.5;
  }
  ol.affirm-alpha > li::before {
    content: counter(aff2, upper-alpha);
    position: absolute; left: 0; top: 4px;
    width: 19px; height: 19px;
    background: #000;
    color: #fff; font-weight: 800; font-size: 9.5px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
  }

  /* Service checkbox grid */
  .services {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px 10px;
    margin-top: 6px;
  }
  .check {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 500; cursor: pointer;
  }
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

  /* "Other" row */
  .other-row {
    display: grid; grid-template-columns: auto 1fr;
    gap: 10px; align-items: end; margin-top: 6px;
  }
  .other-row .check { font-weight: 600; }
  .other-row input[type=text] {
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; padding: 1px 2px 3px;
    height: 20px; outline: none;
  }
  .other-row input[type=text]:focus { background: #f3fafe; border-bottom-color: #41B6E6; }

  /* Signature row */
  .sig-block {
    margin-top: 10px;
    border: 1.5px solid #000;
    border-radius: 6px;
    padding: 8px 12px 10px;
    background: rgba(255,255,255,0.6);
  }
  .sig-block .who {
    font-size: 9.5px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 6px;
  }
  .sig-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
    gap: 10px;
  }
  .sig-cell label {
    display: block; font-size: 7.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #000;
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

  /* Fraud / footer notices */
  .fraud-notice {
    margin-top: 12px;
    background: #fef6ef;
    border-left: 3px solid #DB3EB1;
    padding: 8px 12px;
    font-size: 9.5px;
    font-weight: 600;
    line-height: 1.45;
    color: #000;
  }
  .original-notice {
    margin-top: 6px;
    background: #f3fafe;
    border-left: 3px solid #41B6E6;
    padding: 8px 12px;
    font-size: 9px;
    line-height: 1.45;
    color: #000;
  }

  /* Footer */
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
  .footer .initials input:focus { background: #f3fafe; border-bottom-color: #41B6E6; }
  .footer .right { opacity: 0.7; }

  /* PRINT */
  @media print {
    html, body { background: #fff; }
    .toolbar { display: none !important; }
    .page { box-shadow: none; margin: 0; width: 8.5in; min-height: 11in; }
    .sig-cell input, .other-row input, .footer .initials input {
      background: transparent !important; border-bottom: 1.5px solid #000 !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .check input[type=checkbox]:checked { background: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header, .section-num, .accent-bar, .accent-rule,
    ol.affirm > li::before, ol.affirm-alpha > li::before,
    .fraud-notice, .original-notice, .sig-block {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  }
  @page { size: Letter; margin: 0; }
</style>
</head>
<body>

<div class="toolbar">
  <div class="brand">PRO INJURY · <span class="accent">Standard Disclosure</span></div>
  <div class="pager">
    <a class="page-link" href="intake.html">01 Intake</a>
    <a class="page-link active" href="disclosure.html">02 Disclosure</a>
    <a class="page-link" href="aob.html">03 AOB</a>
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

<form id="disclosureForm" autocomplete="off" onsubmit="event.preventDefault()">

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

  <!-- AUTHORITY -->
  <div class="authority">
    <div class="who">Office of Insurance Regulation</div>
    <div class="what">Bureau of Property &amp; Casualty Forms and Rates</div>
  </div>

  <!-- PAGE TITLE -->
  <div class="page-title">
    <div>
      <h1>STANDARD DISCLOSURE &amp; ACKNOWLEDGEMENT</h1>
      <div class="subtitle">Personal Injury Protection — Initial Treatment or Service Provided</div>
    </div>
    <div class="pagenum"><span>Page</span><span class="badge">02<span class="of"> / 12</span></span></div>
  </div>

  <div class="body">

    <!-- Preamble -->
    <p class="preamble">The undersigned insured person (or guardian of such person) affirms:</p>

    <!-- Section: numbered 1-5 affirmations -->
    <div class="section">
      <ol class="affirm">
        <li>
          The services set forth below were actually rendered. This means that those services have already been provided at <strong>PRO INJURY, LLC</strong>.
          <div class="services">
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
          <div class="other-row">
            <label class="check"><input type="checkbox" name="svc_other" value="yes"> Other:</label>
            <input type="text" name="svc_other_text" placeholder="">
          </div>
        </li>
        <li>I have a right and the <strong>duty to confirm</strong> that the services have already been provided.</li>
        <li>I was <strong>not solicited</strong> by any person to seek any services from the medical provider of the services described above. This means that no person has initiated contact with me and/or persuaded me to use the doctor or licensed professional, clinic, or medical institution that provided the services.</li>
        <li>The medical provider has <strong>explained</strong> the services to me for which payment is being claimed.</li>
        <li>If I notify the insurer in writing of a billing error, I may be entitled to a portion of any reduction in the amounts paid by my motor vehicle insurer. If entitled, my share would be at least <strong>20% of the amount of the reduction, up to $500</strong>.</li>
      </ol>
    </div>

    <!-- Section: A-D licensed professional affirmations -->
    <div class="section">
      <div class="section-head">
        <span class="section-num">PROVIDER</span>
        <h2 class="section-title">Licensed Medical Professional Affirmations</h2>
        <div class="section-rule"></div>
      </div>
      <p class="preamble" style="font-weight:500;font-size:10px;">The undersigned licensed medical professional affirms the statement numbered 1 above and also:</p>
      <ol class="affirm-alpha">
        <li>I have <strong>not solicited</strong> or caused the insured person, who was involved in a motor vehicle accident, to be solicited to make a claim for Personal Injury Protection benefits.</li>
        <li>I have <strong>explained</strong> the services rendered to the insured person, or his or her guardian, <strong>sufficiently</strong> for that person to sign this form with informed consent.</li>
        <li>The accompanying statement or bill is properly completed in all material provisions and all relevant information has been provided therein. This means that each request for information has been responded to <strong>truthfully, accurately,</strong> and in a <strong>substantially complete manner</strong>.</li>
        <li>The coding of procedures on the accompanying statement or bill is proper. This means that <strong>no service has been upcoded, unbundled</strong>, or constitutes an invalid or <strong>not medically necessary diagnostic test</strong> as defined by Section 627.732(15) and (16), Florida Statutes or Section 627.736(5)(b)6, Florida Statutes.</li>
      </ol>
    </div>

    <!-- Signature: insured -->
    <div class="sig-block">
      <div class="who">Insured Person (patient receiving treatment) or Guardian of Insured Person</div>
      <div class="sig-row">
        <div class="sig-cell"><label>Name <span class="hint">PRINT or TYPE</span></label><input type="text" name="insured_name"></div>
        <div class="sig-cell signature"><label>Signature</label><input type="text" name="insured_signature"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="insured_date"></div>
      </div>
    </div>

    <!-- Signature: provider -->
    <div class="sig-block">
      <div class="who">Licensed Medical Professional Rendering Treatment (signature by his or her own hand)</div>
      <div class="sig-row">
        <div class="sig-cell"><label>Name <span class="hint">PRINT or TYPE</span></label><input type="text" name="provider_name"></div>
        <div class="sig-cell signature"><label>Signature</label><input type="text" name="provider_signature"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="provider_date"></div>
      </div>
    </div>

    <!-- Fraud notice -->
    <div class="fraud-notice">
      Any person who knowingly and with intent to injure, defraud, or deceive any insurer files a statement of Claim or an application containing any false, incomplete, or misleading information is guilty of a <strong>felony of the third degree</strong> per Section 817.234(1), Florida Statutes.
    </div>

    <!-- Original notice -->
    <div class="original-notice">
      <strong>Note:</strong> The original of this form must be furnished to the insurer pursuant to Section 627.736(4)(b), Florida Statutes and <strong>may not be electronically furnished</strong>. Failure to furnish this form may result in non-payment of the claim.
    </div>

  </div>

  <!-- FOOTER -->
  <div class="accent-bar"></div>
  <div class="footer">
    <div class="initials"><span>Patient Initials</span><input name="patient_initials_p2" type="text" maxlength="4"></div>
    <div class="right">Pro Injury Medical &amp; Rehabilitation · Rev. 2026.05 · Page 02 of 12 · CRM / Digital</div>
  </div>
</div>

</form>

<script>
(function(){
  const form = document.getElementById('disclosureForm');
  const indicator = document.getElementById('savedIndicator');
  const STORE_KEY = 'proInjury.disclosure.v1';
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
        data[name] = el.checked;
      } else if(el.type === 'radio'){
        if(el.checked) data[name] = el.value;
        else if(!(name in data)) data[name] = '';
      } else {
        data[name] = el.value;
      }
    }
    // Also pull patient name/dob from page1 intake if available
    try {
      const intake = JSON.parse(localStorage.getItem('proInjury.intake.v1') || '{}');
      if(intake.patient_name && !data.insured_name) data.insured_name = intake.patient_name;
    } catch(e){}
    return data;
  }
  function apply(data){
    if(!data) return;
    for(const el of form.querySelectorAll('[name]')){
      const v = data[el.name];
      if(v === undefined) continue;
      if(el.type === 'checkbox'){
        el.checked = !!v;
      } else if(el.type === 'radio'){
        el.checked = (v === el.value);
      } else {
        el.value = v ?? '';
      }
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
      // Auto-fill insured name from intake if blank
      const insuredName = form.querySelector('[name=insured_name]');
      if(insuredName && !insuredName.value){
        const intake = JSON.parse(localStorage.getItem('proInjury.intake.v1') || '{}');
        if(intake.patient_name) insuredName.value = intake.patient_name;
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
    const name = ((data.insured_name || 'patient') + '_disclosure.json').replace(/\s+/g,'_');
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
