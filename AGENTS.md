<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MedicalCRM (Pro Injury) — agent context

Personal-injury practice CRM (Medisoft-style). **Goal:** intake → charges per treatment day → **CMS-1500** print on the practice blank PDF → mail to carriers.

## Stack

- Next.js 16 App Router, TypeScript, Tailwind 4, Supabase (RLS), `src/proxy.ts` only (no `middleware.ts`).

## Billing / CMS-1500 (important)

- **One CMS-1500 per date of service**; **max 6 CPT lines** in box 24 per day.
- Blank template: `public/cms-1500-blank.pdf` (from `npm run cms1500:copy-blank`, source `C:\Users\Stric\Desktop\CMS1500.pdf`).
- Fill logic: `src/lib/cms1500/pdf-fill.ts` + field map `coordinates.ts`.
- Print: `/reports/cms-1500` → `/api/cms-1500/pdf?caseId=&dos=` or `&all=1`.
- Data: patients, cases (policy/diagnosis), insurance_carriers, facilities, providers, visits, charges.
- Practice header: `NEXT_PUBLIC_PRACTICE_*` in `.env.local`.

## Conventions

- Match Wynwood/vice UI: eggplant sidebar, `neon-mint` + `neon-pink` accents (`globals.css`, `docs/THEME.md`); use `<section>` not framer `motion` in forms (hydration-safe).
- Server actions + `revalidatePath` for mutations; `force-dynamic` on PHI pages.
- Do not commit `.env.local`. Commit `cms-1500-blank.pdf` for production.
- User prefers minimal diffs; no commits unless asked.

## Key routes

| Route | Purpose |
|-------|---------|
| `/cases/[id]/visits/new` | Transaction entry |
| `/reports/cms-1500` | Claim picker (insurance) |
| `/reports/cms-1500/print` | PDF preview |
| `/reports/attorney-ledger` | Attorney ledger picker |
| `/reports/attorney-ledger/print?caseId=` | Printable ledger (charges + payments by carrier) |
| `/reports/ar-aging` | A/R aging 30/60/90 by insurance carrier |
| `/portal` | iPad kiosk intake (role `kiosk`) |
| `/intake-packets` | Staff review of saved 8-page packets |
| `/billing/payments` | Post payment on one charge line |
| `/billing/payments/batch` | One check → multiple lines (distribute oldest-first) |
| `/portal` | iPad patient intake (kiosk user only) |
| `/portal/intake` | Sectioned intake form |
| `/providers`, `/facilities`, `/insurance` | List CRUD |

## Roadmap

See `docs/ROADMAP.md` — performance → payments → dashboard; attorneys get ledgers, insurance gets CMS-1500.

## Performance

- Sidebar persists via `AuthCrmShell` in `src/app/layout.tsx` (not re-mounted per page).
- Dev: `npm run dev` (Turbopack). Run server inside WSL for fast compiles.
