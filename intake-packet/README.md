# Pro Injury Intake Packet — deprecated standalone app

**Merged into the main CRM.** Use `/portal` (iPad kiosk) and `/intake-packets` (staff) in the root `medicalcrm` project. See `docs/INTAKE-KIOSK.md` and `docs/IPAD-SETUP.md`.

---

# Pro Injury Intake Packet (Next.js + Postgres) — legacy notes

Standalone staff app for the 8-page bilingual intake packet. Uses Archie’s HTML forms as the visual/UI layer, `forms-manifest.json` for field names, and `schema.sql` for PostgreSQL tables.

## Setup

1. **Copy forms** (from `MedicalCRM/intake-forms` on Windows):

   ```bash
   cd intake-packet
   npm run sync-forms
   ```

2. **Environment** — copy `.env.example` to `.env.local` and set:

   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `STAFF_EMAIL` / `STAFF_PASSWORD` — staff login (NextAuth credentials)

3. **Database**:

   ```bash
   npm run db:migrate
   ```

4. **Run** (port 3001 so it does not clash with the main CRM on 3000):

   ```bash
   npm install
   npm run dev
   ```

5. Open http://localhost:3001 → sign in → **New packet** → open forms 01–08.

## Architecture

- **Option A** (implemented): Original `forms/*.html` served at `/serve/forms/[slug]?packetId=` with an injected script that replaces `localStorage` with:
  - `GET /api/intake-packets/[id]` — full packet (cross-form prefill)
  - `GET /api/intake-packets/[id]/[form-name]` — single form
  - `POST /api/intake-packets/[id]/[form-name]` — auto-save (400ms debounce unchanged)
- **NextAuth** — credentials provider; middleware protects staff UI and APIs.
- **Tables** — `patients`, `intake_packets`, one table per form (see `intake-forms/schema/schema.sql`).

## Form slugs

| Slug | Table |
|------|--------|
| `intake` | `patient_intake` |
| `disclosure` | `pip_disclosure` |
| `aob` | `assignment_benefits` |
| `hipaa` | `hipaa_consent` |
| `fraud` | `fraud_statement` |
| `financial` | `financial_consent` |
| `treatment` | `treatment_consent` |
| `records` | `records_release` |

## Notes

- Intake saves sync `patients` and `intake_packets.date_of_accident` from page 01 fields.
- Pages 02–08 prefill identity from saved intake via API (same fields as original `proInjury.intake.v1` localStorage).
- `referral_source` (HIPAA multi-checkbox) is stored as JSON text after migration patch.
- Main CRM (`medicalcrm/`) remains on Supabase; this app uses its own Postgres database.

See `intake-forms/README.md` for legal/PCI/HIPAA constraints when editing form copy.
