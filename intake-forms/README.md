# Pro Injury — Patient Intake Packet (CRM-Ready)

> 📐 **Handoff doc for the Cursor coding agent.** Read this first. Everything you need to wire the intake into the MedicalCRM app is in this folder.

---

## What this is

A **8-page bilingual (English/Spanish) digital intake packet** for **Pro Injury Medical & Rehabilitation**. Each page is a fully working HTML form with:

- Real form inputs (`<input>`, `<select>`, `<textarea>`, radio groups, checkboxes)
- Auto-save to `localStorage` (keyed per form — see manifest)
- Print CSS that produces pixel-identical US-Letter output with prefilled data
- Cross-page identity prefill (page 01 intake feeds pages 02-08)
- Pager navigation between all 8 pages
- Print / Export JSON / Import JSON / Reset toolbar

---

## File layout

```
MedicalCRM/intake-forms/
├── README.md                 ← you are here
├── forms/                    ← the 8 deliverable HTML pages
│   ├── intake.html           (01 of 08) Patient Intake
│   ├── disclosure.html       (02 of 08) PIP Standard Disclosure
│   ├── aob.html              (03 of 08) Assignment of Benefits, Release & Demand
│   ├── hipaa.html            (04 of 08) HIPAA Consent & Privacy Acknowledgement
│   ├── fraud.html            (05 of 08) Fraud Statement
│   ├── financial.html        (06 of 08) Financial Responsibility & Deductible
│   ├── treatment.html        (07 of 08) Treatment Consent & Radiology Warning
│   └── records.html          (08 of 08) Authorization for Health Info Disclosure
├── schema/
│   ├── forms-manifest.json   ← every field on every page, with kind/type/options
│   └── schema.sql            ← PostgreSQL CREATE TABLE for every form
└── builders/                 ← Python generators used to rebuild forms from source
    ├── build_crm_form.py     ← rebuilds intake.html
    ├── build_final7.py       ← rebuilds the other 7 (was originally final7, now produces 8)
    └── (others — older one-off builders, kept for reference)
```

---

## Firm info — embedded in every page

| Field | Value |
|---|---|
| Firm | Pro Injury Medical & Rehabilitation |
| **Miami Lakes (primary)** | **15165 NW 77th Ave, Suite 1001 · Miami Lakes, FL 33014** |
| Fort Myers | 6309 Corporate Court, Suite 100/103 · Fort Myers, FL 33919 |
| Phone | 786-362-5480 |
| Fax | 786-362-5638 |
| Email | admin@ProInjuryLLC.com |

⚠️ The Miami Lakes address was changed from `5881 NW 151st Street, Suite 112` to the address above. Use the new address everywhere.

---

## Design system

| Token | Value |
|---|---|
| Page size | 816 × 1056 px (US Letter @ 96 DPI) |
| Body font | Inter, system-ui fallback |
| Accent gradient | `linear-gradient(135deg, #41B6E6 0%, #DB3EB1 100%)` |
| Header | Black bar, white text, gold/cyan accent rule |
| Watermark | Pro Injury monogram, 6% opacity, centered |
| Section pill | Cyan→magenta gradient with white number |
| Print | `@page { size: Letter; margin: 0; }` + color-fidelity flags |

All 8 pages share these tokens. If you need to rebrand, the source of truth is the CSS at the top of each HTML file (it's repeated for offline portability). For shared CSS in the CRM app, see `builders/build_final7.py` → `SHARED_CSS` constant.

---

## How the pages work today (vanilla HTML/JS)

Each page is **self-contained** — open it in a browser, fill it out, print it. No server required.

- **Auto-save:** every `input`/`change` event debounces a 400ms save to `localStorage` under a per-form key (e.g. `proInjury.intake.v1`, `proInjury.disclosure.v1` — see manifest).
- **Cross-page prefill:** pages 02-08 call `JSON.parse(localStorage.getItem('proInjury.intake.v1'))` on load and copy `patient_name`, `dob`, `phone_cell`, `email`, `meta_date_of_accident` into their own identity strip if blank.
- **Export JSON:** dumps the entire form state to `{patient_name}_{form}.json`.
- **Import JSON:** loads a previously exported file.
- **Print:** uses `window.print()` with a dedicated `@media print` block.

---

## How to wire it into the CRM app (recommended path)

There are two reasonable approaches:

### Option A — keep the static HTML, point it at the CRM API

Minimal lift. Replace the `localStorage` save with a `POST /api/intake-packets/{id}/{form_name}` call. Replace the cross-page prefill with a `GET /api/intake-packets/{id}` on load.

**Files to touch (per form):** just the `<script>` block at the bottom. The `collect()` and `apply()` functions already serialize the entire form to a flat object — you just need to swap the storage layer.

### Option B — port the markup into your CRM's component framework (React/Vue/Razor/etc.)

More work, but you get:
- Type-safety + validation per field
- Server-side rendering of prefilled forms
- One single source of truth for design tokens

The **HTML structure** in `forms/*.html` is ready-to-copy into a JSX/Vue/Razor template. The CSS is portable.

### Either way — use these as the source of truth:

- **Field names + types:** `schema/forms-manifest.json`
- **Database tables:** `schema/schema.sql`
- **Visual reference:** open any `forms/*.html` in a browser

---

## Database schema

`schema/schema.sql` defines:

- **`patients`** — master patient record (id, name, DOB, phone, email).
- **`intake_packets`** — one packet per (patient + date of accident). Status tracks `in_progress | completed | archived`.
- **One table per form** (`patient_intake`, `pip_disclosure`, `assignment_benefits`, `hipaa_consent`, `fraud_statement`, `financial_consent`, `treatment_consent`, `records_release`) — each has a `packet_id` FK + `signed_at` timestamp + every form field as a column.

PostgreSQL syntax. Adjust types if you're using MySQL or SQLite (`SERIAL` → `INTEGER PRIMARY KEY AUTOINCREMENT`, `BOOLEAN` → `TINYINT(1)`, etc.).

### Multi-value fields

A few fields can hold multiple values (e.g. `referral_source` is a multi-checkbox group). The schema generates them as `VARCHAR(64)` but **the JavaScript serializes them as a JSON array**. Recommend storing as `JSONB` (Postgres) or `JSON` (MySQL 5.7+) and treating them as arrays. Check the manifest for `"multi": true`.

---

## Special behaviors to preserve when porting

### `intake.html` (page 01)
- Field `meta_date_of_accident` is reused everywhere — keep this exact name.
- The patient name is split into 3 inputs (`patient_first_name`, `patient_middle`, `patient_last_name`) on intake but **assembled into a single `patient_name` field** before being read by other pages. **TODO when porting:** add the assembly logic (intake currently does NOT do this — pages 02-08 read `intake.patient_name` which doesn't exist yet). Either:
  - Concatenate on save in intake (`patient_name = first + ' ' + (middle ? middle+' ' : '') + last`), or
  - Change other forms to read first/middle/last separately.

### `hipaa.html` (page 04)
- Two inline `<span id="nameRef1/2">` elements get live-populated with the patient name as you type into the identity strip. This makes the legal "I, ____" clauses self-fill.
- The "I have no restrictions" checkbox toggles the `disabled` state of the restrictions textarea.

### `financial.html` (page 06) — PCI compliance
- ⚠️ **Do not add a "card number" text input.** The previous PDF version had one — it was a PCI exposure. The form intentionally redirects card capture to the in-office terminal via a magenta-bordered warning.

### `records.html` (page 08) — HIPAA
- Sensitive-info disclosure is **opt-in per category** (drug/alcohol, mental health, HIV/AIDS, STD, TB, genetic). Unchecked = withheld. Don't auto-check these.

---

## Florida-required legal text — DO NOT REWORD

These pages contain statutorily required language. The English text must remain word-for-word as currently written. Spanish translations beneath are summaries (not legal substitutes).

- `disclosure.html` — Florida OIR PIP Standard Disclosure (§627.736, §817.234)
- `aob.html` — Assignment of Benefits language
- `records.html` — Florida Admin Code §64B8-10.003

If you edit them, run a check against Florida Statutes and your firm's legal counsel.

---

## Rebuilding the forms

The Python builders in `builders/` regenerate the HTML from source. They embed the watermark + logo from `/mnt/c/Users/Stric/MedicalCRM/design/page1.html` (lines 246 and 252 — the original base64-embedded images).

```bash
cd MedicalCRM/intake-forms/builders
python3 build_crm_form.py   # regenerates intake.html
python3 build_final7.py     # regenerates pages 02-08
```

Outputs go to `/mnt/c/Users/Stric/MedicalCRM/design/` (the original location). Copy them into `intake-forms/forms/` after rebuild if you want this README's view to stay current.

---

## What the user (Jay) explicitly asked for

1. ✅ All fields from the original PDFs preserved
2. ✅ Match existing design (page1.html aesthetic) exactly
3. ✅ Bilingual English/Spanish on every page
4. ✅ Working web forms (real inputs, not styled divs)
5. ✅ Print produces pixel-identical paper output with patient data prefilled
6. ✅ Auto-prefill across the packet (page 1 → all other pages)
7. ✅ Dates stay blank by default (Jay specifically rejected today's-date auto-fill)
8. ✅ Old Miami address swapped throughout
9. ✅ Consolidated from 10 to 8 pages where forms logically merged (HIPAA Consent + Privacy Ack, Fin Resp + Deductible, Treatment + Radiology)
10. ✅ Proofread + business improvements applied (PCI compliance fix, witness signatures, communication consents, referral source tracking)

---

## Next steps for Cursor

1. Decide Option A vs Option B above.
2. Pick a stack if not already chosen (the `MedicalCRM/` root doesn't have a `package.json` yet — greenfield).
3. Hook the forms to the database using `schema/schema.sql` as the table definitions and `schema/forms-manifest.json` as the field map.
4. Add backend endpoints for save/load (mirror the current `localStorage` keys for easy migration).
5. Optionally add an "intake portal" landing page that creates a new packet, then redirects through pages 01 → 08.

---

## Questions for Jay before Cursor builds

These weren't decided yet and Cursor will need answers:

- **Stack?** React + Node/Express? Next.js? Razor + .NET? Plain Express + EJS?
- **Database?** PostgreSQL? MySQL? SQL Server? (Schema is Postgres but trivially portable)
- **Hosting?** Local network only? Cloud? HIPAA-compliant hosting required (Aptible, AWS BAA, etc.)?
- **Auth?** Patient-facing portal or staff-only? SSO?
- **E-signature stack?** Built-in canvas signature, DocuSign integration, or just typed signature + ack checkbox (current state)?
- **Print-vs-store?** Always store digitally + print on demand, or print at end of intake and store as PDF?

---

**Built by Archie 📐 · Last polished 2026-05-21**
