# MedicalCRM

A modern, secure CRM for medical practices — built for managing patient
records, scheduling, billing, and clinical workflows with care.

> ⚠️ This system handles **PHI (Protected Health Information)** and **billing
> data**. Accuracy and security are non-negotiable. Measure twice, cut once.

## Stack

- **Next.js 16** (App Router) — full-stack React framework
- **TypeScript** — type safety, especially around patient & billing data
- **Tailwind CSS** — utility-first styling
- **Supabase** — Postgres database + auth + Row Level Security (RLS)
- **Cursor** — primary editor/IDE

## Project Status

🚧 **Alpha** — active development (personal-injury / Medisoft-style billing).

**Working today:** auth, patients, cases (policy/diagnosis/attachments), insurance carriers, providers & facilities (CRUD), transaction entry (visits + charges), case charge ledger, **CMS-1500 print** on your blank PDF (one form per treatment day, max 6 CPT lines).

**Next up:** schedule, payments/A/R, attorneys list UI, field calibration on CMS-1500 if needed.

## Goals

- [x] Patient records management (CRUD, search)
- [x] Case / PI intake (insurance, attorney, diagnosis, auth)
- [x] Insurance carrier master list (seed + auto-fill on cases)
- [x] Providers & facilities lists
- [x] Transaction entry → charges per visit date
- [x] CMS-1500 (HCFA) claim print from case data
- [ ] Appointment scheduling
- [ ] Payments & A/R aging
- [ ] Clinical notes / encounter documentation
- [ ] Multi-user with role-based access (clinicians, billing staff, admins)
- [ ] Audit logging for PHI access
- [ ] HIPAA-aware design from day one

## Getting Started

### Prerequisites

- Node.js 20+ (running in WSL/Ubuntu)
- Supabase project (already provisioned)
- Cursor IDE

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Install the CMS-1500 blank template (required for claim printing):
   ```bash
   npm run cms1500:copy-blank
   ```
   Copies `C:\Users\Stric\Desktop\CMS1500.pdf` → `public/cms-1500-blank.pdf` (commit this file for Vercel). See `public/cms-1500-README.txt`.

3. Copy your Supabase keys into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_pub_...
   SUPABASE_SECRET_KEY=sb_secret_...
   # Optional — only for running SQL migrations from WSL (not used by the app):
   SUPABASE_DB_PASSWORD=<database-password-from-dashboard>
   ```
   See [docs/DATABASE.md](docs/DATABASE.md) for migrations (e.g. Florida insurance carriers).
4. Run the dev server (Turbopack — faster compile on tab changes):
   ```bash
   npm run dev
   ```
   Use `npm run dev:webpack` only if Turbopack misbehaves on a route.
5. Open <http://localhost:3000>

**Print claims:** Reports → CMS-1500, or Case → Treatment charges → Print.

## Deploy live (GitHub + Vercel + domain)

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for step-by-step:

1. Push this repo to **GitHub** (private recommended).
2. Import on **Vercel** and add Supabase env vars from `.env.example`.
3. Set Supabase **Site URL** to your Vercel URL (required for login).
4. Add a **custom domain** in Vercel when ready.

Your Supabase database is already cloud-hosted — the live site uses the same data once env vars match.

## Project Structure

```
src/
├── app/
│   ├── cases/[id]/visits/new/   # Transaction entry
│   ├── reports/cms-1500/        # Claim picker + print
│   └── api/cms-1500/pdf/        # Filled PDF on blank template
├── lib/
│   ├── cms1500/                 # build, fetch, pdf-fill, coordinates
│   ├── charge-ledger*.ts
│   └── supabase/
└── public/cms-1500-blank.pdf    # Your NUCC blank (not optional in prod)
```

## Security Notes

- `.env.local` is **gitignored** — never commit it.
- The **publishable key** is safe in client code **only if RLS is enabled** on
  every table. Verify RLS before exposing any table.
- The **secret key** is server-side only. It bypasses RLS. Treat it like a
  password.
- All tables touching PHI must have RLS policies. No exceptions.

## License

Private / proprietary. © Jay.
