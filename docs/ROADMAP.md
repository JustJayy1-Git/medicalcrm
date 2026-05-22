# MedicalCRM roadmap (Medisoft-style PI billing)

Ordered work queue. **You do not need to approve each step** — agents follow this file unless you redirect.

## Done (2025-05)

- [x] **Performance** — Persistent sidebar via `AuthCrmShell` in root layout; pathname from proxy; Turbopack default dev; route-level `loading.tsx` for main panel only.
- [x] **Attorney ledger (v1)** — Reports → Attorney ledger; printable charges/payments by insurance carrier (`charges.paid`).

## Phase 1 — Billing core (in progress)

### 1. Payments / A/R

| Task | Detail | Status |
|------|--------|--------|
| Post payment UI | `/billing/payments` | **Live v1** |
| Server action | `postChargePayment` on `charges.paid` | **Live** |
| A/R aging report | `/reports/ar-aging` — 30/60/90 by carrier | **Live** |
| Batch payment | `/billing/payments/batch` — one check, distribute oldest-first | **Live** |

**Medisoft parallel:** Payment entry → updates account ledger balances attorneys see.

### 2. Dashboard

| Task | Detail |
|------|--------|
| Today’s visits | Count visits where `visit_date = today` |
| Recent activity | Last N patients/cases/visits updated |
| Open A/R snapshot | Sum `balance` on non-paid charges |

## Phase 2 — Reports (insurance vs attorney)

| Report | Audience | Status |
|--------|----------|--------|
| CMS-1500 | Insurance (HCFA) | Live |
| Treatment charge summary | Internal / attorney | Live (per case) |
| **Attorney account ledger** | Attorney (charges + payments by carrier) | **Live v1** |
| A/R aging by carrier | Billing office | **Live** |
| Day sheet | Billing office | Planned |
| LOP / patient statement | Patient | Later |

## Deferred (low volume ~10 patients/month)

- **Schedule** — not needed unless patient volume grows; `/schedule` stays a stub.

## In progress — Patient iPad intake

See **`docs/INTAKE-KIOSK.md`**.

- [ ] `/portal` kiosk UI (no staff sidebar)
- [ ] Kiosk Supabase user + RLS (insert patient only)
- [ ] Merge Archie’s new intake form
- [ ] Thank-you / reset flow for next patient

## Phase 2b — Next (when needed)

- Day sheet report
- Multi-carrier ledger sections

## Phase 3 — Operations

- Lists hub vs dedicated CRUD (carriers, CPT, ICD already partial)
- Multi-carrier ledger sections (secondary auto)
- Audit log for PHI access

## Phase 4 — Production hardening

- Field calibration CMS-1500 if overlay drifts
- Role-based menus (billing vs front desk)
- Deploy checklist (`docs/DEPLOY.md`)

## Conventions

- **Insurance outbound:** CMS-1500 only (one form per DOS, max 6 CPT in box 24).
- **Attorney outbound:** Ledger + treatment summary — never 1500 forms.
- **Data entry:** Cases → Transaction entry → charges; payments adjust ledger.

## How to run dev (fast sidebar)

```bash
npm run dev          # Turbopack
npm run dev:webpack  # fallback only
```

Restart dev server after pulling performance changes.
