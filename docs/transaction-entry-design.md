# Transaction Entry — Design Reference

**Source:** Reverse-engineered from CGM Medisoft (Pro Injury LLC live system)
via 5 screenshots dated 2026-05-19. Sample case: DIAZ, ALEXIS — MVA visit
5/15/2026, $1,140 charges.

## What we're replacing

Medisoft Transaction Entry is the **single most-used screen** for the office.
This is where every visit becomes a billable record. Every dollar of revenue
goes through this form. If we get this wrong, we fail.

## Medisoft's data model (observed)

### Header (patient/case context)
- **Chart** — patient identifier (e.g., `DIAAL000` for DIAZ, ALEXIS,
  DOB 1/4/1987). Format = first 3 letters of last name + first 2 of first
  name + 3-digit collision counter.
- **Case** — numeric case id (e.g., `520`) + label (e.g., `MVA 5/14/2026`).
  One patient can have multiple cases.
- **Use Predictive Dx Search** — toggle (default on)
- **Last Payment Date / Amount**
- **Last Visit Date**
- **Visit:** `1 of A 100` — visit counter within the case (1st of authorized 100)
- **Global Coverage Until** — date the global period covers (post-op style)

### Insurance panel (right side)
- **Tabs:** `Policy 1` | `Policy 2` | `Policy 3` | `Patient`
- **Aging buckets:** 0-30 | 31-60 | 61-90 | 91+
- **Totals:** Total, TNB, Policy Copay, OA, Annual Deductible, YTD

### Charges grid (the main event)
Observed columns:

| Column | Type | Example | Notes |
|---|---|---|---|
| Date | date | 5/15/2026 | DOS |
| Procedure | CPT code | 99204, 97140 | with search |
| PP | bool/checkbox | ☐ | "Paid in full"? "Patient Paid"? — confirm with Jay |
| Units | int | 1, 2 | |
| Amount | currency | 70.00 | per-unit fee |
| Total | currency | 140.00 | units × amount (calculated) |
| Diag 1 | ICD pointer | S13.4XXA | per-line dx |
| Diag 2 | ICD pointer | S33.5XXA | |
| Diag 3 | ICD pointer | S23.3XXA | |
| Diag 4 | ICD pointer | S43.402A | |
| Diag 5 | ICD pointer | M25.552 | |
| Diag 6 | ICD pointer | (empty) | up to 6 dx per line |

Note: Medisoft stores **actual ICD-10 codes** in the Diag columns, not
pointers (1/2/3/4) like CMS-1500 does. Translation happens at claim print
time.

Not visible in screenshots but standard for Medisoft:
- **Modifiers 1-4** (e.g., GP, 59, 25, 26) — per line, used for therapy &
  bundling rules
- **Place of Service (POS)** — usually 11 (office) for Pro Injury
- **Provider** — billing provider for the line
- **Allowed amount** — fee schedule contracted rate

Action buttons: `New | Delete | MultiLink | Note | EDI Notes | Details`

- **MultiLink** = Medisoft's macro feature. One click adds a preset bundle of
  CPT lines (e.g., "PI follow-up visit" = 97140 + 97110 + 97012 all at once).
  **HIGH-VALUE feature** for charge entry speed. Must replicate.

### Payments/Adjustments grid (lower)
Columns: Date | Pay/Adj Code | Who Paid | Description | Provider | Amount |
Check Number | Unapplied

Action buttons: `Apply | New | Delete | Note`

### Totals panel (far right)
- Charges, Adjustments, Subtotal, Payment, Balance
- **Account Total** (whole-case running balance)
- Calculate Totals toggle

### Bottom bar
`Update All | Print Receipt | Print Claim | View Statements | Close | Save Transactions`

### Function keys (must replicate via keyboard shortcuts)
- F1 = Help
- F3 = Save all
- F6 = Search
- F8 = New patient
- F9 = Edit patient
- F10 = Eligibility check
- F11 = Quick balance
- Ctrl+F7 = View statements

## Sample real visit (DIAZ, ALEXIS — 5/15/2026)

| Date | CPT | Units | Amt | Total | What it is |
|---|---|---|---|---|---|
| 5/15/2026 | 99204 | 1 | $450 | $450 | New patient office visit, level 4 |
| 5/15/2026 | 97035 | 2 | $45 | $90 | Ultrasound therapy |
| 5/15/2026 | 97140 | 2 | $70 | $140 | Manual therapy |
| 5/15/2026 | 97032 | 2 | $50 | $100 | E-stim, unattended |
| 5/15/2026 | 97110 | 2 | $80 | $160 | Therapeutic exercise |
| 5/15/2026 | 97112 | 2 | $75 | $150 | Neuromuscular re-education |
| 5/15/2026 | 97012 | 1 | $50 | $50 | Mechanical traction |
| **Total** | | | | **$1,140** | |

All linked to 5 ICD-10 codes (cervical, lumbar, thoracic, shoulder sprains +
joint pain). This is a **textbook Pro Injury first visit** — keep this as
our golden test case.

## Schema implications (our DB)

We need (some already exist as stubs, verify against 0001-0011):

```
patients (existing — verify chart_number format/uniqueness)
cases (existing — verify case_number, label, dates)
visits (NEW or extend? — DOS, case_id, visit_number "1 of 100", auth count)
charges (NEW — visit_id, cpt_code, units, fee, modifiers[4], pos, provider_id)
charge_diagnoses (NEW — many-to-many: charge_id → icd10_code, ordinal 1-6)
payments (NEW — case_id, date, pay_adj_code, payer, amount, check_num)
payment_applications (NEW — payment_id → charge_id, amount applied)
cpt_codes (NEW — code, description, default_fee, default_modifiers)
multilink_templates (NEW — preset CPT bundles for common visit types)
```

Already in supabase from prior migrations:
- ICD-10 PI starter pack (migration 0009)
- Insurance carriers with payer IDs (migrations 0010, 0012)
- Case attachments (migration 0011)

## UI design principles (carry over from earlier sessions)

1. **Keyboard-first.** Tab/arrow through grid like Medisoft. F-keys mapped.
2. **Dense grid.** No bloated cards. Multiple charge lines visible at once.
3. **Inline dx attachment.** Don't make user open a modal per line.
4. **CPT autocomplete.** Type "97140" or "manual therapy" → match.
5. **MultiLink (templates).** One-click bundles for common visit patterns.
6. **Live totals.** Subtotal updates as user types.
7. **Predictive dx search** — when typing the next dx, suggest from this
   case's diagnosis list (Medisoft does this).
8. **Visit counter.** "Visit 3 of 100" — auth tracking is critical for PIP.

## V1 cuts (build first, defer rest)

**Must have:**
- Patient + case picker (chart number autocomplete)
- Charges grid (CPT, units, amount, total, dx 1-4) — **no PP column**
- Save charges to DB
- CPT code lookup
- ICD-10 code lookup (inline)
- Running totals
- **Visit counter `n of 23`** with warning when ≥ 20
- Common PI CPT seed (the 7 codes from DIAZ above + a few more)
- **3 MultiLink templates pre-seeded:** Initial / Follow-up / Therapy day

**V1.5 (right after):**
- MultiLink templates
- Modifiers
- Place of service
- Payment/adjustment entry
- Print receipt / claim

**Later:**
- EDI Notes / claim notes
- Eligibility check (F10)
- Statements view
- Multi-policy aging

## Answered by Jay (2026-05-19)

1. **PP column** — Medisoft has it but Pro Injury **doesn't use it**. Skip
   it in our build. (One less column = one less thing to explain.)
2. **Fees are Pro Injury's own self-pay rates** — set by Jay, not contracted
   PIP rates. We bill them out to PIP carriers anyway. So:
   - **One fee schedule, owned by the practice.** Not per-carrier.
   - Jay assigns prices to each CPT code.
   - Carrier-specific allowed amounts come back later via EOB/payment posting.
3. **Authorized visit cap = 23 visits per case** (Pro Injury standard, not
   100). Composition:
   - **1 Initial visit** (E&M new patient — 99204-type)
   - **1 Follow-up visit** (E&M established — 99213/14-type)
   - **21 Therapy visits** (just the therapy CPT bundle, no E&M)
   - Total: 23 sessions across ~5 weeks (3 weeks therapy → follow-up → 2 weeks therapy)
   - **Visit counter format becomes:** `Visit 1 of 23`
4. **MultiLink templates — confirmed by Jay 2026-05-19:**

   **Initial visit** — done **once per case**, day 1 only:
   | CPT | Units | Fee | Total |
   |---|---|---|---|
   | 99204 | 1 | $450 | $450 |

   **Therapy day** — the main bundle, used 21× per case:
   | CPT | Units | Fee | Total |
   |---|---|---|---|
   | 97035 | 2 | $45 | $90 |
   | 97140 | 2 | $70 | $140 |
   | 97032 | 2 | $50 | $100 |
   | 97110 | 2 | $80 | $160 |
   | 97112 | 2 | $75 | $150 |
   | 97012 | 1 | $50 | $50 |
   | **Total** | | | **$690** |

   **Follow-up visit** — done **once per case**, ~week 3, codes TBD
   (likely 99213 or 99214). Confirm with Jay before seeding.

   **Important UX insight:** the DIAZ $1,140 first visit = `Initial visit`
   template + `Therapy day` template applied **on the same date**. The user
   picks both buttons; the system stacks the charge lines. We do NOT need a
   combined "Initial+Therapy" template — keep templates atomic, let the user
   compose them.

## Pro Injury visit cadence (the business rhythm)

```
Week 1: Initial visit         (1×)
        Therapy days          (≤4×)
Week 2: Therapy days          (5×)
Week 3: Therapy days          (5×)
        Follow-up visit       (1×)
Week 4: Therapy days          (5×)
Week 5: Therapy days          (≤2×)
--------------------------------
Total:  1 Initial + 1 Follow-up + 21 Therapy = 23 sessions
```

This means **case lifecycle is ~5 weeks** under normal cadence. The visit
counter should highlight when a patient is approaching the 23-visit cap so
the office can plan discharge / additional authorization.

## Next concrete step

1. Seed CPT codes for common PI procedures (97110, 97140, 97032, 97012,
   97035, 97112, 99203, 99204, 99213, 99214, 95851, etc.)
2. Design schema for `visits` + `charges` + `charge_diagnoses` (migration 0013)
3. Wire a minimal Transaction Entry page that mirrors the grid layout
4. Connect to existing patient/case data
