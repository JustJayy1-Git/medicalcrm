import type { Cms1500Claim } from "@/lib/cms1500/types";
import "./cms1500-print.css";

function Check({ on, label }: { on: boolean; label: string }) {
  return (
    <label className="cms-check">
      <span className="cms-box">{on ? "X" : ""}</span>
      <span>{label}</span>
    </label>
  );
}

function D3({ d }: { d: { mm: string; dd: string; yy: string } }) {
  return (
    <span className="cms-d3">
      <span>{d.mm}</span>
      <span>{d.dd}</span>
      <span>{d.yy}</span>
    </span>
  );
}

const DIAG = "ABCDEFGHIJKL".split("");

export function Cms1500Form({ claim }: { claim: Cms1500Claim }) {
  const lines = [...claim.serviceLines];
  while (lines.length < 6) {
    lines.push({
      from: { mm: "", dd: "", yy: "" },
      to: { mm: "", dd: "", yy: "" },
      placeOfService: "",
      cpt: "",
      modifier: "",
      diagnosisPointer: "",
      charges: "",
      units: "",
      renderingNpi: "",
    });
  }

  return (
    <article className="cms-sheet">
      <header className="cms-title-row">
        <div>
          <h1>HEALTH INSURANCE CLAIM FORM</h1>
          <p>APPROVED BY NATIONAL UNIFORM CLAIM COMMITTEE (NUCC) 02/12</p>
        </div>
        <p className="cms-pica">PICA</p>
        {claim.meta.pageCount > 1 ? (
          <p className="cms-page">
            Page {claim.meta.page} of {claim.meta.pageCount} · DOS{" "}
            {claim.meta.dateOfService}
          </p>
        ) : null}
      </header>

      <section className="cms-block">
        <p className="cms-label">1. Insurance type</p>
        <div className="cms-checks">
          <Check on={claim.insuranceType.medicare} label="Medicare" />
          <Check on={claim.insuranceType.medicaid} label="Medicaid" />
          <Check on={claim.insuranceType.tricare} label="TRICARE" />
          <Check on={claim.insuranceType.champva} label="CHAMPVA" />
          <Check on={claim.insuranceType.groupHealth} label="Group health" />
          <Check on={claim.insuranceType.feca} label="FECA" />
          <Check on={claim.insuranceType.other} label="Other" />
        </div>
        <p className="cms-field">
          <span>1a. Insured ID</span>
          <strong>{claim.insuredId}</strong>
        </p>
      </section>

      <section className="cms-grid-2">
        <p className="cms-field">
          <span>2. Patient name</span>
          <strong>{claim.patientName}</strong>
        </p>
        <p className="cms-field">
          <span>3. DOB / Sex</span>
          <D3 d={claim.patientBirth} />{" "}
          <strong>{claim.patientSex}</strong>
        </p>
        <p className="cms-field">
          <span>4. Insured name</span>
          <strong>{claim.insuredName}</strong>
        </p>
        <p className="cms-field">
          <span>5. Patient address</span>
          <strong>
            {claim.patientAddress}, {claim.patientCity} {claim.patientState}{" "}
            {claim.patientZip}
          </strong>
        </p>
        <p className="cms-field">
          <span>6. Relationship</span>
          <Check on={claim.relationshipSelf} label="Self" />
          <Check on={claim.relationshipSpouse} label="Spouse" />
          <Check on={claim.relationshipChild} label="Child" />
          <Check on={claim.relationshipOther} label="Other" />
        </p>
        <p className="cms-field">
          <span>7. Insured address</span>
          <strong>
            {claim.insuredAddress}, {claim.insuredCity} {claim.insuredState}{" "}
            {claim.insuredZip}
          </strong>
        </p>
        <p className="cms-field">
          <span>8. Reserved</span>
          <strong>{claim.reserved}</strong>
        </p>
        <p className="cms-field">
          <span>9. Other insured</span>
          <strong>{claim.otherInsuredName}</strong>
        </p>
        <p className="cms-field">
          <span>10. Condition related to</span>
          <Check on={claim.conditionRelated.employment} label="Employment" />
          <Check on={claim.conditionRelated.autoAccident} label="Auto" />
          {claim.conditionRelated.autoAccidentState ? (
            <strong> State: {claim.conditionRelated.autoAccidentState}</strong>
          ) : null}
          <Check on={claim.conditionRelated.otherAccident} label="Other" />
        </p>
        <p className="cms-field">
          <span>11. Policy / group #</span>
          <strong>{claim.policyGroup}</strong>
        </p>
      </section>

      <section className="cms-grid-3">
        <p className="cms-field">
          <span>14. Date of injury</span>
          <D3 d={claim.dateOfInjury} />
        </p>
        <p className="cms-field">
          <span>15. Other date</span>
          <D3 d={claim.otherDate} />
        </p>
        <p className="cms-field">
          <span>16–18. Unable to work / hospitalization</span>
          <D3 d={claim.unableToWorkFrom} /> – <D3 d={claim.unableToWorkTo} />
        </p>
      </section>

      <section className="cms-block">
        <p className="cms-label">21. Diagnosis (ICD-10)</p>
        <ol className="cms-dx">
          {DIAG.map((letter, i) => (
            <li key={letter}>
              <span>{letter}.</span> {claim.diagnosisCodes[i] ?? ""}
            </li>
          ))}
        </ol>
        <p className="cms-field">
          <span>22. Resubmission / original ref</span>
          <strong>
            {claim.resubmissionCode} {claim.originalRef}
          </strong>
        </p>
        <p className="cms-field">
          <span>23. Prior authorization</span>
          <strong>{claim.priorAuth}</strong>
        </p>
      </section>

      <section className="cms-block">
        <p className="cms-label">24. Service lines</p>
        <table className="cms-lines">
          <thead>
            <tr>
              <th>A Date</th>
              <th>B POS</th>
              <th>D CPT</th>
              <th>Mod</th>
              <th>E Ptr</th>
              <th>F $</th>
              <th>G Units</th>
              <th>J NPI</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((ln, i) => (
              <tr key={i}>
                <td>
                  <D3 d={ln.from} />
                </td>
                <td>{ln.placeOfService}</td>
                <td>{ln.cpt}</td>
                <td>{ln.modifier}</td>
                <td>{ln.diagnosisPointer}</td>
                <td className="cms-money">{ln.charges}</td>
                <td>{ln.units}</td>
                <td className="cms-mono">{ln.renderingNpi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="cms-grid-2">
        <p className="cms-field">
          <span>25. Federal tax ID</span>
          <strong>{claim.taxId}</strong>
          <Check on={claim.taxIdTypeEin} label="EIN" />
          <Check on={claim.taxIdTypeSsn} label="SSN" />
        </p>
        <p className="cms-field">
          <span>26. Patient account #</span>
          <strong>{claim.patientAccount}</strong>
        </p>
        <p className="cms-field">
          <span>27. Accept assignment</span>
          <strong>{claim.acceptAssignment ? "YES" : "NO"}</strong>
        </p>
        <p className="cms-field">
          <span>28–30. Total / paid / balance</span>
          <strong>
            {claim.totalCharge} / {claim.amountPaid} / {claim.balanceDue}
          </strong>
        </p>
        <p className="cms-field">
          <span>31. Physician signature</span>
          <strong>{claim.physicianSignature}</strong>
        </p>
        <p className="cms-field">
          <span>32. Service facility</span>
          <strong>
            {claim.serviceFacility.name} · {claim.serviceFacility.address},{" "}
            {claim.serviceFacility.city} {claim.serviceFacility.state}{" "}
            {claim.serviceFacility.zip} · NPI {claim.serviceFacility.npi}
          </strong>
        </p>
        <p className="cms-field cms-span-2">
          <span>33. Billing provider</span>
          <strong>
            {claim.billingProvider.name} · {claim.billingProvider.phone} · NPI{" "}
            {claim.billingProvider.npi}
          </strong>
        </p>
      </section>

      <footer className="cms-carrier">
        <p>
          <span>Send to (carrier)</span>
          <strong>{claim.carrierName}</strong>
        </p>
        <p>{claim.carrierAddress}</p>
      </footer>
    </article>
  );
}
