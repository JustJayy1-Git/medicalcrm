import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Cms1500Claim } from "./types";
import {
  CMS1500_DIAGNOSIS,
  CMS1500_FIELDS,
  CMS1500_INSURANCE_CHECKS,
  CMS1500_REF_HEIGHT,
  CMS1500_REF_WIDTH,
  CMS1500_SERVICE_COLS,
  CMS1500_SERVICE_LINE_TOPS,
  type PercentBox,
} from "./coordinates";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "cms-1500-blank.pdf",
);

function templateExists() {
  try {
    return fs.existsSync(TEMPLATE_PATH);
  } catch {
    return false;
  }
}

function boxOrigin(
  box: PercentBox,
  pageW: number,
  pageH: number,
  fontSize: number,
) {
  const scaleX = pageW / CMS1500_REF_WIDTH;
  const scaleY = pageH / CMS1500_REF_HEIGHT;
  const x = (box.left / 100) * pageW + 2 * scaleX;
  const y =
    pageH -
    ((box.top + box.height) / 100) * pageH +
    fontSize * 0.35 * scaleY;
  const maxWidth = (box.width / 100) * pageW;
  return { x, y, maxWidth, scaleX, scaleY };
}

function drawInBox(
  page: ReturnType<PDFDocument["getPages"]>[0],
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  text: string,
  box: PercentBox,
  size = 8,
) {
  const t = (text ?? "").trim();
  if (!t) return;
  const { width, height } = page.getSize();
  const { x, y, maxWidth } = boxOrigin(box, width, height, size);
  page.drawText(t, {
    x,
    y,
    size: size * (width / CMS1500_REF_WIDTH),
    font,
    color: rgb(0, 0, 0),
    maxWidth,
  });
}

function drawX(
  page: ReturnType<PDFDocument["getPages"]>[0],
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  leftPct: number,
  topPct: number,
) {
  const { width, height } = page.getSize();
  const box: PercentBox = { left: leftPct, top: topPct, width: 2, height: 2 };
  drawInBox(page, font, "X", box, 9);
}

async function fillClaimPage(
  pdfDoc: PDFDocument,
  templateBytes: Uint8Array,
  claim: Cms1500Claim,
) {
  const templateDoc = await PDFDocument.load(templateBytes);
  const [templatePage] = await pdfDoc.copyPages(templateDoc, [0]);
  const page = pdfDoc.addPage(templatePage);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const F = CMS1500_FIELDS;

  const ins = claim.insuranceType;
  if (ins.medicare) drawX(page, font, CMS1500_INSURANCE_CHECKS.medicare.left, CMS1500_INSURANCE_CHECKS.medicare.top);
  if (ins.medicaid) drawX(page, font, CMS1500_INSURANCE_CHECKS.medicaid.left, CMS1500_INSURANCE_CHECKS.medicaid.top);
  if (ins.tricare) drawX(page, font, CMS1500_INSURANCE_CHECKS.tricare.left, CMS1500_INSURANCE_CHECKS.tricare.top);
  if (ins.champva) drawX(page, font, CMS1500_INSURANCE_CHECKS.champva.left, CMS1500_INSURANCE_CHECKS.champva.top);
  if (ins.groupHealth) drawX(page, font, CMS1500_INSURANCE_CHECKS.groupHealth.left, CMS1500_INSURANCE_CHECKS.groupHealth.top);
  if (ins.feca) drawX(page, font, CMS1500_INSURANCE_CHECKS.feca.left, CMS1500_INSURANCE_CHECKS.feca.top);
  if (ins.other) drawX(page, font, CMS1500_INSURANCE_CHECKS.other.left, CMS1500_INSURANCE_CHECKS.other.top);

  // Payer mailing block — where the claim gets delivered.
  drawInBox(page, font, claim.carrierName, F.carrierName);
  if (claim.carrierAddress) {
    const parts = claim.carrierAddress.split(",").map((s) => s.trim());
    const street = parts[0] ?? "";
    const rest = parts.slice(1).join(", ");
    drawInBox(page, font, street, F.carrierAddress1);
    drawInBox(page, font, rest, F.carrierAddress2);
  }

  drawInBox(page, font, claim.insuredId, F.insuredId);
  drawInBox(page, font, claim.patientName, F.patientName);
  drawInBox(page, font, claim.patientBirth.mm, F.patientBirthMm);
  drawInBox(page, font, claim.patientBirth.dd, F.patientBirthDd);
  drawInBox(page, font, claim.patientBirth.yy, F.patientBirthYy);
  if (claim.patientSex === "M") drawX(page, font, F.patientSexM.left, F.patientSexM.top);
  if (claim.patientSex === "F") drawX(page, font, F.patientSexF.left, F.patientSexF.top);
  drawInBox(page, font, claim.insuredName, F.insuredName);
  drawInBox(page, font, claim.patientAddress, F.patientStreet);
  drawInBox(page, font, claim.patientCity, F.patientCity);
  drawInBox(page, font, claim.patientState, F.patientState);
  drawInBox(page, font, claim.patientZip, F.patientZip);
  drawInBox(page, font, claim.patientPhone, F.patientPhone);
  drawInBox(page, font, claim.insuredAddress, F.insuredStreet);
  drawInBox(page, font, claim.insuredCity, F.insuredCity);
  drawInBox(page, font, claim.insuredState, F.insuredState);
  drawInBox(page, font, claim.insuredZip, F.insuredZip);
  drawInBox(page, font, claim.policyGroup, F.policyGroup);
  if (claim.patientSignatureOnFile) {
    drawInBox(page, font, "SIGNATURE ON FILE", F.patientSignature12);
  }
  if (claim.insuredSignatureOnFile) {
    drawInBox(page, font, "SIGNATURE ON FILE", F.insuredSignature13);
  }
  drawInBox(page, font, claim.dateOfInjury.mm, F.injuryMm);
  drawInBox(page, font, claim.dateOfInjury.dd, F.injuryDd);
  drawInBox(page, font, claim.dateOfInjury.yy, F.injuryYy);
  drawInBox(page, font, claim.referringProvider, F.referringProvider);
  drawInBox(page, font, claim.referringNpi, F.referringNpi);
  drawInBox(page, font, claim.priorAuth, F.priorAuth);

  claim.diagnosisCodes.forEach((code, i) => {
    if (CMS1500_DIAGNOSIS[i]) drawInBox(page, font, code, CMS1500_DIAGNOSIS[i], 7);
  });

  const lineH = 3.1;
  claim.serviceLines.slice(0, 6).forEach((ln, i) => {
    const top = CMS1500_SERVICE_LINE_TOPS[i] ?? CMS1500_SERVICE_LINE_TOPS[0];
    const col = (key: keyof typeof CMS1500_SERVICE_COLS, val: string) => {
      const c = CMS1500_SERVICE_COLS[key];
      drawInBox(page, font, val, {
        left: c.left,
        top,
        width: c.width,
        height: lineH,
      });
    };
    col("fromMm", ln.from.mm);
    col("fromDd", ln.from.dd);
    col("fromYy", ln.from.yy);
    col("toMm", ln.to.mm);
    col("toDd", ln.to.dd);
    col("toYy", ln.to.yy);
    col("pos", ln.placeOfService);
    col("cpt", ln.cpt);
    col("modifier", ln.modifier);
    col("pointer", ln.diagnosisPointer);
    col("charges", ln.charges);
    col("units", ln.units);
    col("npi", ln.renderingNpi);
  });

  drawInBox(page, font, claim.taxId, F.taxId);
  drawInBox(page, font, claim.patientAccount, F.patientAccount);
  if (claim.acceptAssignment) {
    drawX(page, font, F.acceptYes.left, F.acceptYes.top);
  } else {
    drawX(page, font, F.acceptNo.left, F.acceptNo.top);
  }
  drawInBox(page, font, claim.totalCharge, F.totalCharge);
  drawInBox(page, font, claim.physicianSignature, F.physicianSignature);
  drawInBox(page, font, claim.serviceFacility.name, F.facilityName);
  drawInBox(page, font, claim.serviceFacility.address, F.facilityStreet);
  drawInBox(page, font, claim.serviceFacility.city, F.facilityCity);
  drawInBox(page, font, claim.serviceFacility.state, F.facilityState);
  drawInBox(page, font, claim.serviceFacility.zip, F.facilityZip);
  drawInBox(page, font, claim.serviceFacility.npi, F.facilityNpi);
  drawInBox(page, font, claim.billingProvider.name, F.billingName);
  drawInBox(page, font, claim.billingProvider.address, F.billingStreet);
  drawInBox(page, font, claim.billingProvider.city, F.billingCity);
  drawInBox(page, font, claim.billingProvider.state, F.billingState);
  drawInBox(page, font, claim.billingProvider.zip, F.billingZip);
  drawInBox(page, font, claim.billingProvider.phone, F.billingPhone);
  drawInBox(page, font, claim.billingProvider.npi, F.billingNpi);

  return page;
}

/** Fill your blank CMS1500.pdf template; returns PDF bytes. */
export async function generateFilledCms1500Pdf(
  claims: Cms1500Claim[],
): Promise<Uint8Array> {
  if (!templateExists()) {
    throw new Error(
      "Missing public/cms-1500-blank.pdf. Run: npm run cms1500:copy-blank",
    );
  }
  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.create();

  for (const claim of claims) {
    await fillClaimPage(pdfDoc, templateBytes, claim);
  }

  if (pdfDoc.getPageCount() === 0) {
    const templateDoc = await PDFDocument.load(templateBytes);
    const [p] = await pdfDoc.copyPages(templateDoc, [0]);
    pdfDoc.addPage(p);
  }

  return pdfDoc.save();
}

export function cms1500TemplateReady() {
  return templateExists();
}
