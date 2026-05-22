"use client";

import type { ReactNode } from "react";
import type { Cms1500Claim } from "@/lib/cms1500/types";
import {
  CMS1500_DIAGNOSIS,
  CMS1500_FIELDS,
  CMS1500_INSURANCE_CHECKS,
  CMS1500_SERVICE_COLS,
  CMS1500_SERVICE_LINE_TOPS,
  type PercentBox,
} from "@/lib/cms1500/coordinates";
import "./cms1500-overlay-print.css";

function Box({
  box,
  children,
  className = "",
}: {
  box: PercentBox;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`cms-ov-field ${className}`}
      style={{
        left: `${box.left}%`,
        top: `${box.top}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
      }}
    >
      {children}
    </span>
  );
}

function Mark({ box, text }: { box: PercentBox; text: string }) {
  return (
    <Box box={box}>
      <span className="cms-ov-text">{text}</span>
    </Box>
  );
}

function CheckAt({
  left,
  top,
  on,
}: {
  left: number;
  top: number;
  on: boolean;
}) {
  if (!on) return null;
  return (
    <span
      className="cms-ov-check"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      X
    </span>
  );
}

export function Cms1500OverlayForm({ claim }: { claim: Cms1500Claim }) {
  const lines = claim.serviceLines.slice(0, 6);
  const F = CMS1500_FIELDS;
  const ins = claim.insuranceType;

  return (
    <article className="cms-ov-page">
      <img
        src="/cms-1500-blank-page1.png"
        alt=""
        className="cms-ov-bg"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallback !== "1") {
            img.dataset.fallback = "1";
            img.src = "/cms-1500-blank.pdf";
          }
        }}
      />

      <CheckAt {...CMS1500_INSURANCE_CHECKS.medicare} on={ins.medicare} />
      <CheckAt {...CMS1500_INSURANCE_CHECKS.medicaid} on={ins.medicaid} />
      <CheckAt {...CMS1500_INSURANCE_CHECKS.tricare} on={ins.tricare} />
      <CheckAt {...CMS1500_INSURANCE_CHECKS.champva} on={ins.champva} />
      <CheckAt {...CMS1500_INSURANCE_CHECKS.groupHealth} on={ins.groupHealth} />
      <CheckAt {...CMS1500_INSURANCE_CHECKS.feca} on={ins.feca} />
      <CheckAt {...CMS1500_INSURANCE_CHECKS.other} on={ins.other} />

      <Mark box={F.insuredId} text={claim.insuredId} />
      <Mark box={F.patientName} text={claim.patientName} />
      <Mark box={F.patientBirthMm} text={claim.patientBirth.mm} />
      <Mark box={F.patientBirthDd} text={claim.patientBirth.dd} />
      <Mark box={F.patientBirthYy} text={claim.patientBirth.yy} />
      {claim.patientSex === "M" ? (
        <CheckAt left={F.patientSexM.left} top={F.patientSexM.top} on />
      ) : null}
      {claim.patientSex === "F" ? (
        <CheckAt left={F.patientSexF.left} top={F.patientSexF.top} on />
      ) : null}
      <Mark box={F.insuredName} text={claim.insuredName} />
      <Mark box={F.patientStreet} text={claim.patientAddress} />
      <Mark box={F.patientCity} text={claim.patientCity} />
      <Mark box={F.patientState} text={claim.patientState} />
      <Mark box={F.patientZip} text={claim.patientZip} />
      <Mark box={F.patientPhone} text={claim.patientPhone} />
      <Mark box={F.insuredStreet} text={claim.insuredAddress} />
      <Mark box={F.insuredCity} text={claim.insuredCity} />
      <Mark box={F.insuredState} text={claim.insuredState} />
      <Mark box={F.insuredZip} text={claim.insuredZip} />
      <Mark box={F.policyGroup} text={claim.policyGroup} />
      <Mark box={F.injuryMm} text={claim.dateOfInjury.mm} />
      <Mark box={F.injuryDd} text={claim.dateOfInjury.dd} />
      <Mark box={F.injuryYy} text={claim.dateOfInjury.yy} />
      <Mark box={F.priorAuth} text={claim.priorAuth} />

      {claim.diagnosisCodes.map((code, i) =>
        CMS1500_DIAGNOSIS[i] ? (
          <Mark key={i} box={CMS1500_DIAGNOSIS[i]} text={code} />
        ) : null,
      )}

      {lines.map((ln, i) => {
        const top = CMS1500_SERVICE_LINE_TOPS[i];
        const lineH = 3.1;
        const col = (key: keyof typeof CMS1500_SERVICE_COLS, val: string) => {
          const c = CMS1500_SERVICE_COLS[key];
          return (
            <Mark
              key={`${i}-${key}`}
              box={{ left: c.left, top, width: c.width, height: lineH }}
              text={val}
            />
          );
        };
        return (
          <span key={i}>
            {col("fromMm", ln.from.mm)}
            {col("fromDd", ln.from.dd)}
            {col("fromYy", ln.from.yy)}
            {col("toMm", ln.to.mm)}
            {col("toDd", ln.to.dd)}
            {col("toYy", ln.to.yy)}
            {col("pos", ln.placeOfService)}
            {col("cpt", ln.cpt)}
            {col("modifier", ln.modifier)}
            {col("pointer", ln.diagnosisPointer)}
            {col("charges", ln.charges)}
            {col("units", ln.units)}
            {col("npi", ln.renderingNpi)}
          </span>
        );
      })}

      <Mark box={F.taxId} text={claim.taxId} />
      <Mark box={F.patientAccount} text={claim.patientAccount} />
      {claim.acceptAssignment ? (
        <CheckAt left={F.acceptYes.left} top={F.acceptYes.top} on />
      ) : (
        <CheckAt left={F.acceptNo.left} top={F.acceptNo.top} on />
      )}
      <Mark box={F.totalCharge} text={claim.totalCharge} />
      <Mark box={F.physicianSignature} text={claim.physicianSignature} />
      <Mark box={F.facilityName} text={claim.serviceFacility.name} />
      <Mark box={F.facilityStreet} text={claim.serviceFacility.address} />
      <Mark box={F.facilityCity} text={claim.serviceFacility.city} />
      <Mark box={F.facilityState} text={claim.serviceFacility.state} />
      <Mark box={F.facilityZip} text={claim.serviceFacility.zip} />
      <Mark box={F.facilityNpi} text={claim.serviceFacility.npi} />
      <Mark box={F.billingName} text={claim.billingProvider.name} />
      <Mark box={F.billingStreet} text={claim.billingProvider.address} />
      <Mark box={F.billingCity} text={claim.billingProvider.city} />
      <Mark box={F.billingState} text={claim.billingProvider.state} />
      <Mark box={F.billingZip} text={claim.billingProvider.zip} />
      <Mark box={F.billingPhone} text={claim.billingProvider.phone} />
      <Mark box={F.billingNpi} text={claim.billingProvider.npi} />
    </article>
  );
}
