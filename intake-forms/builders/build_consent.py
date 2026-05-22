#!/usr/bin/env python3
"""Build page 4 - New Patient Consent to Use and Disclosure of Health Info.
Fixes typos, adds bilingual labels, DOB/email/phone, witness, restrictions textarea,
revocation acknowledgment, communication consents, and referral source.
"""
import os

SRC = "/mnt/c/Users/Stric/MedicalCRM/design/page1.html"
OUT = "/mnt/c/Users/Stric/MedicalCRM/design/consent.html"

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
<title>Pro Injury — Consent to Use &amp; Disclosure of Health Information · CRM</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #1a1d24; }

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
    margin: 0; font-size: 13px; font-weight: 800;
    letter-spacing: -0.01em; color: #000;
    text-transform: uppercase;
    max-width: 600px;
  }
  .page-title h1 .es {
    display:block;
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

  /* Identity strip */
  .ident-strip {
    background: #fafafa;
    border-bottom: 1px solid #d0d0d0;
    padding: 8px 24px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 12px;
  }
  .ident-strip .field label {
    display: block; font-size: 7.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: #000;
    line-height: 1.15;
  }
  .ident-strip .field .es {
    font-weight: 400; opacity: .55; margin-left: 4px;
    letter-spacing: 0; text-transform: none;
  }
  .ident-strip .field input {
    margin-top: 3px; width: 100%; height: 22px;
    border: 0; border-bottom: 1.5px solid #000;
    background: transparent; font: inherit; color: #000;
    padding: 1px 2px 3px; outline: none;
  }
  .ident-strip .field input:focus { background: #f3fafe; border-bottom-color: #41B6E6; }

  /* Body */
  .body { padding: 10px 24px 14px; }
  .body p { margin: 0 0 6px 0; text-align: justify; }
  .body ul { margin: 4px 0 8px 22px; padding: 0; }
  .body ul li { margin-bottom: 2px; }
  .body p strong { font-weight: 700; }
  .body .es-inline {
    color: #555; font-style: italic; font-size: 8.5px; margin-left: 4px;
  }

  /* Section title */
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

  /* Restrictions textarea */
  .restrictions {
    margin-top: 4px;
    width: 100%;
    height: 60px;
    border: 1.5px solid #000;
    border-radius: 4px;
    background: transparent;
    font: inherit; color: #000;
    padding: 6px 8px; outline: none;
    resize: vertical;
  }
  .restrictions:focus { background: #f3fafe; border-color: #41B6E6; }
  .restrictions:disabled { background: #f0f0f0; opacity: 0.5; }

  /* Check rows */
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
  .sig-row { display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 10px; }
  .sig-row.three-equal { grid-template-columns: 1fr 1fr 1fr; }
  .sig-cell label {
    display: block; font-size: 7.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: #000;
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
    .check input[type=checkbox]:checked { background: #000 !important;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header, .accent-bar, .accent-rule, .section-num, .sig-block, .ident-strip {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  }
  @page { size: Letter; margin: 0; }
</style>
</head>
<body>

<div class="toolbar">
  <div class="brand">PRO INJURY · <span class="accent">HIPAA Consent</span></div>
  <div class="pager">
    <a class="page-link" href="intake.html">01 Intake</a>
    <a class="page-link" href="disclosure.html">02 Disclosure</a>
    <a class="page-link" href="aob.html">03 AOB</a>
    <a class="page-link active" href="consent.html">04 Consent</a>
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

<form id="consentForm" autocomplete="off" onsubmit="event.preventDefault()">

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
    <h1>NEW PATIENT CONSENT TO THE USE &amp; DISCLOSURE OF HEALTH INFORMATION FOR TREATMENT, PAYMENT, OR HEALTHCARE OPERATIONS
      <span class="es">Consentimiento del Nuevo Paciente para el Uso y Divulgación de Información Médica</span>
    </h1>
    <div class="pagenum"><span>Page</span><span class="badge">04<span class="of"> / 12</span></span></div>
  </div>

  <!-- IDENTITY STRIP -->
  <div class="ident-strip">
    <div class="field">
      <label>Patient Name <span class="es">/ Nombre del paciente</span></label>
      <input type="text" name="patient_name">
    </div>
    <div class="field">
      <label>Date of Birth <span class="es">/ Fecha de nacimiento</span></label>
      <input type="date" name="patient_dob">
    </div>
    <div class="field">
      <label>Phone <span class="es">/ Teléfono</span></label>
      <input type="tel" name="patient_phone">
    </div>
    <div class="field">
      <label>Email <span class="es">/ Correo</span></label>
      <input type="email" name="patient_email">
    </div>
  </div>

  <div class="body">

    <p>I, <strong><span id="nameRef1" style="font-weight:700;border-bottom:1.5px dotted #888; padding: 0 14px; display:inline-block; min-width:180px;"></span></strong>, understand that as part of my health care, <strong>PRO INJURY</strong> originates and maintains paper and/or electronic records describing my health history, symptoms, examination and test results, diagnoses, treatment, and any plans for future care or treatment. I understand that this information serves as:</p>
    <ul>
      <li>A basis for planning my care and treatment;</li>
      <li>A means of communication among the many health professionals who contribute to my care;</li>
      <li>A source of information for applying my diagnosis and procedural information to my bill;</li>
      <li>A means by which a third-party payer can verify that services billed were actually provided; and</li>
      <li>A tool for routine healthcare operations such as assessing quality and reviewing the competence of healthcare professionals.</li>
    </ul>

    <p>I understand that I have been provided with a <em>Notice of Privacy Practices</em> that provides a more complete description of information uses and disclosures. I understand that I have the following rights and privileges:</p>
    <ul>
      <li>The right to review the notice prior to signing this consent;</li>
      <li>The right to object to the use of my health information for marketing or fundraising purposes; and</li>
      <li>The right to request restrictions as to how my health information may be used or disclosed to carry out treatment, payment, or healthcare operations.</li>
    </ul>

    <p>I, <strong><span id="nameRef2" style="font-weight:700;border-bottom:1.5px dotted #888; padding: 0 14px; display:inline-block; min-width:180px;"></span></strong>, understand that <strong>PRO INJURY</strong> is not required to agree to the restrictions requested. I understand that I may revoke this consent in writing, except to the extent that the organization has already taken action in reliance thereon. I also understand that by refusing to sign this consent or by revoking this consent, this organization may refuse to treat me as permitted by Section 164.506 of the Code of Federal Regulations.</p>

    <p>I further understand that <strong>PRO INJURY</strong> reserves the right to change its notice and practices, and that prior to implementation, in accordance with Section 164.520 of the Code of Federal Regulations, <strong>PRO INJURY</strong> will send a copy of any revised notice to the address I've provided (whether U.S. mail or, if I agree, email).</p>

    <!-- Restrictions -->
    <div class="section">
      <div class="section-head">
        <span class="section-num">01</span>
        <h2 class="section-title">Restrictions or Authorization <span class="es">/ Restricciones o Autorización</span></h2>
        <div class="section-rule"></div>
      </div>
      <label class="check"><input type="checkbox" name="no_restrictions" value="yes" id="noRestrictionsCb"> I have <strong style="margin:0 3px">no</strong> restrictions or special authorizations <span class="es">/ No tengo restricciones</span></label>
      <textarea class="restrictions" name="restrictions" id="restrictionsBox" placeholder="If you have restrictions or special authorizations, list them here / Si tiene restricciones, escríbalas aquí"></textarea>
    </div>

    <p style="margin-top:10px;">I understand that as part of this organization's treatment, payment, or healthcare operations, it may become necessary to disclose my protected health information to another entity, and I consent to such disclosure for these permitted uses, including disclosures via fax or email.</p>

    <!-- Communication consents -->
    <div class="section">
      <div class="section-head">
        <span class="section-num">02</span>
        <h2 class="section-title">Communication Consent <span class="es">/ Consentimiento de Comunicación</span></h2>
        <div class="section-rule"></div>
      </div>
      <div class="check-row">
        <label class="check"><input type="checkbox" name="consent_sms" value="yes"> Text message (SMS) reminders <span class="es">/ Recordatorios por texto</span></label>
        <label class="check"><input type="checkbox" name="consent_email" value="yes"> Email reminders &amp; notices <span class="es">/ Recordatorios por correo</span></label>
        <label class="check"><input type="checkbox" name="consent_voicemail" value="yes"> Voicemail messages <span class="es">/ Mensajes de voz</span></label>
        <label class="check"><input type="checkbox" name="consent_billing_electronic" value="yes"> Electronic billing communications <span class="es">/ Facturación electrónica</span></label>
      </div>
    </div>

    <!-- Referral source (marketing) -->
    <div class="section">
      <div class="section-head">
        <span class="section-num">03</span>
        <h2 class="section-title">How Did You Hear About Us? <span class="es">/ ¿Cómo se enteró de nosotros?</span></h2>
        <div class="section-rule"></div>
      </div>
      <div class="check-row">
        <label class="check"><input type="checkbox" name="referral_source" value="attorney"> Attorney <span class="es">/ Abogado</span></label>
        <label class="check"><input type="checkbox" name="referral_source" value="friend_family"> Friend / Family <span class="es">/ Amigo / Familia</span></label>
        <label class="check"><input type="checkbox" name="referral_source" value="google"> Google / Online <span class="es">/ Internet</span></label>
        <label class="check"><input type="checkbox" name="referral_source" value="social_media"> Social Media <span class="es">/ Redes sociales</span></label>
        <label class="check"><input type="checkbox" name="referral_source" value="prior_patient"> Returning Patient <span class="es">/ Paciente anterior</span></label>
        <label class="check"><input type="checkbox" name="referral_source" value="other"> Other <span class="es">/ Otro</span></label>
      </div>
      <input type="text" name="referral_source_other" placeholder="If Other, please specify / Si Otro, especifique" style="margin-top:6px;width:100%;height:22px;border:0;border-bottom:1.5px solid #000;background:transparent;font:inherit;padding:1px 2px 3px;outline:none">
    </div>

    <!-- Revocation acknowledgment -->
    <div class="section" style="margin-top:10px;">
      <label class="check" style="font-size:10.5px;">
        <input type="checkbox" name="ack_revocation" value="yes" required>
        I acknowledge that I may revoke this consent in writing at any time, subject to the limits described above.
        <span class="es">/ Reconozco que puedo revocar este consentimiento por escrito en cualquier momento.</span>
      </label>
    </div>

    <!-- Signature block -->
    <div class="sig-block">
      <div class="who">Patient / Guardian Signature</div>
      <div class="sig-row">
        <div class="sig-cell"><label>Patient's Name <span class="hint">Print</span></label><input type="text" name="patient_name_print" id="patientNamePrint"></div>
        <div class="sig-cell signature"><label>Patient's Signature <span class="hint">If a minor, parent/guardian</span></label><input type="text" name="patient_signature"></div>
        <div class="sig-cell"><label>Date</label><input type="date" name="signed_date"></div>
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

  <div class="accent-bar"></div>
  <div class="footer">
    <div class="initials"><span>Patient Initials</span><input name="patient_initials_p4" type="text" maxlength="4"></div>
    <div class="right">Pro Injury Medical &amp; Rehabilitation · Rev. 2026.05 · Page 04 of 12 · CRM / Digital</div>
  </div>
</div>

</form>

<script>
(function(){
  const form = document.getElementById('consentForm');
  const indicator = document.getElementById('savedIndicator');
  const STORE_KEY = 'proInjury.consent.v1';
  let saveTimer = null;

  const nameRef1 = document.getElementById('nameRef1');
  const nameRef2 = document.getElementById('nameRef2');
  const nameInput = form.querySelector('[name=patient_name]');
  const printInput = document.getElementById('patientNamePrint');
  const noRestrictionsCb = document.getElementById('noRestrictionsCb');
  const restrictionsBox = document.getElementById('restrictionsBox');

  function syncName(){
    const v = nameInput.value || '';
    nameRef1.textContent = v;
    nameRef2.textContent = v;
    if(printInput && !printInput.value) printInput.value = v;
  }
  function syncRestrictions(){
    if(noRestrictionsCb.checked){
      restrictionsBox.value = '';
      restrictionsBox.disabled = true;
    } else {
      restrictionsBox.disabled = false;
    }
  }
  function setIndicator(state){
    if(state==='saving'){ indicator.textContent = '●  saving…'; indicator.style.color = '#41B6E6'; }
    else if(state==='saved'){ indicator.textContent = '●  saved locally'; indicator.style.color = '#7fdf7f'; }
    else { indicator.textContent = '●  unsaved'; indicator.style.color = '#c8d2e0'; }
  }
  function collect(){
    const data = {};
    const seen = new Set();
    for(const el of form.querySelectorAll('[name]')){
      const n = el.name;
      if(el.type === 'checkbox'){
        // referral_source is multi-value
        if(!(n in data)){
          // detect if multiple checkboxes share this name
          const all = form.querySelectorAll(`[name="${n}"][type=checkbox]`);
          if(all.length > 1){
            data[n] = Array.from(all).filter(x=>x.checked).map(x=>x.value);
          } else {
            data[n] = el.checked;
          }
        }
      } else {
        data[n] = el.value;
      }
    }
    return data;
  }
  function apply(data){
    if(!data) return;
    for(const el of form.querySelectorAll('[name]')){
      const v = data[el.name]; if(v === undefined) continue;
      if(el.type === 'checkbox'){
        if(Array.isArray(v)) el.checked = v.includes(el.value);
        else el.checked = !!v;
      } else {
        el.value = v ?? '';
      }
    }
    syncName(); syncRestrictions();
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
      // Prefill from intake
      const intake = JSON.parse(localStorage.getItem('proInjury.intake.v1') || '{}');
      if(intake.patient_name && !nameInput.value) nameInput.value = intake.patient_name;
      if(intake.dob && !form.querySelector('[name=patient_dob]').value) form.querySelector('[name=patient_dob]').value = intake.dob;
      if(intake.phone_cell && !form.querySelector('[name=patient_phone]').value) form.querySelector('[name=patient_phone]').value = intake.phone_cell;
      if(intake.email && !form.querySelector('[name=patient_email]').value) form.querySelector('[name=patient_email]').value = intake.email;
      syncName(); syncRestrictions();
    } catch(e){ console.error(e); }
  }
  window.resetForm = function(){
    if(!confirm('Clear all fields? This cannot be undone.')) return;
    form.reset();
    localStorage.removeItem(STORE_KEY);
    setIndicator('unsaved');
    syncName(); syncRestrictions();
  };
  window.exportJSON = function(){
    const blob = new Blob([JSON.stringify(collect(), null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    const data = collect();
    const name = ((data.patient_name || 'patient') + '_consent.json').replace(/\s+/g,'_');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    URL.revokeObjectURL(a.href);
  };
  window.importJSON = function(ev){
    const file = ev.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = () => { try { apply(JSON.parse(r.result)); save(); } catch(e){ alert('Invalid JSON'); } };
    r.readAsText(file);
  };

  nameInput.addEventListener('input', syncName);
  noRestrictionsCb.addEventListener('change', syncRestrictions);
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
