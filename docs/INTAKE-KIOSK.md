# Intake kiosk (merged into MedicalCRM)

The Archie 8-page HTML intake packet runs inside the main CRM. The standalone `intake-packet/` app is deprecated; use this document instead.

## Routes

| Route | Purpose |
|-------|---------|
| `/portal` | iPad home — start new packet |
| `/portal/packet/[id]/forms/[slug]` | Form viewer (iframe + API save) |
| `/portal/done` | Thank-you + next patient |
| `/intake-packets` | Staff list of saved packets |
| `/api/intake-packets/...` | Load/save JSON (replaces localStorage) |
| `/serve/forms/[slug]?packetId=` | Patched HTML forms |

## Kiosk role

- Profile `role = 'kiosk'`.
- Proxy redirects any non-portal URL back to `/portal`.
- Allowed: `/portal/*`, `/api/intake-packets/*`, `/serve/forms/*`, `/login`, `/auth/*`.

## Staff exit

- Env: `KIOSK_EXIT_PIN`
- UI: **Staff** button → PIN → `signOut()` → `/login`

## Data

- Tables: `intake_packets`, `patient_intake`, `pip_disclosure`, … (migration `0015`).
- New portal packet creates a placeholder `patients` row; page 01 updates name/DOB/phone when saved.

## iPad hard lock

Combine:

1. **KioskGuard** (in-app — blocks stray links, history back)  
2. **Guided Access** (iOS — prevents leaving Safari)  
3. **Home Screen PWA** (no Safari URL bar)

Patients cannot access billing, charts, or reports while signed in as kiosk.
