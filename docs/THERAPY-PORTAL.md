# Therapy portal (massage therapist)

After the NP consultation, the patient begins therapy. The therapist has her
own login and an iPad-friendly portal at **`/therapy`** — no billing, no staff CRM.

## Access

1. Create or pick a Supabase auth user for the therapist (e.g. `therapist@proinjury.local`).
2. In **SQL Editor**, set role:

```sql
update public.profiles
set role = 'therapist', is_active = true, full_name = 'Massage Therapist'
where email = 'therapist@proinjury.local';
```

3. Therapist signs in at the staff login URL (`/login`) and is redirected to **`/therapy`**.

## Workflow

| Step | Where |
|------|--------|
| Patient intake (iPad) | `/portal` |
| NP consultation (NOFA, EMC, initial report) | `/clinical` |
| Therapy queue | `/therapy` |
| Per patient: consent + therapy sheet + history | `/therapy/cases/{caseId}` |

- **Consent for therapy** — one per case; patient signs on the iPad
  (drawn signature stored in `therapy_consents.consent_json`, `signed_at` set
  when a signature is present). Placeholder fields until the practice's
  consent document is uploaded and mapped.
- **Therapy sheet** — one row per visit in `therapy_sessions`
  (`session_date` + `session_json`: services performed, body areas, duration,
  pain level, notes). Queue badges show NP status and consent status per case.

## Signatures

Shared canvas component: `src/components/signature-pad.tsx` (touch + mouse,
PNG data URL in a hidden input). Also used by the NP clinical forms
(provider signature on NOFA / EMC / initial report, patient signature on NOFA).

## Migrations

- `0021_therapist_portal.sql` — `therapist` role + `therapy_consents` + `therapy_sessions`
- Paste file: `supabase/PASTE_IN_SQL_EDITOR_0021.sql`

## Role confinement

`therapist` sessions are confined to `/therapy` by the proxy
(`src/lib/supabase/update-session.ts`); staff CRM, `/portal`, and `/clinical`
URLs redirect back to `/therapy`.
