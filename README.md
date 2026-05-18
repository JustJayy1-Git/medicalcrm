# MedicalCRM

A modern, secure CRM for medical practices — built for managing patient
records, scheduling, billing, and clinical workflows with care.

> ⚠️ This system handles **PHI (Protected Health Information)** and **billing
> data**. Accuracy and security are non-negotiable. Measure twice, cut once.

## Stack

- **Next.js 15** (App Router) — full-stack React framework
- **TypeScript** — type safety, especially around patient & billing data
- **Tailwind CSS** — utility-first styling
- **Supabase** — Postgres database + auth + Row Level Security (RLS)
- **Cursor** — primary editor/IDE

## Project Status

🚧 **Pre-alpha** — scaffold just created (2026-05-18). Nothing built yet.

## Goals

- [ ] Patient records management (CRUD, search, history)
- [ ] Appointment scheduling
- [ ] Billing & invoicing
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
2. Copy your Supabase keys into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_pub_...
   SUPABASE_SECRET_KEY=sb_secret_...
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open <http://localhost:3000>

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
├── lib/
│   └── supabase/
│       ├── client.ts     # Browser-side Supabase client (publishable key)
│       └── server.ts     # Server-side client + admin client (secret key)
└── ...
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
