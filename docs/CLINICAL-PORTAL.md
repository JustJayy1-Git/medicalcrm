# Clinical portal (NP / MD)

After iPad intake is **completed**, the patient is queued for nurse practitioner consultation.

## Access

1. Create or pick a Supabase auth user for the NP (e.g. `np@proinjury.local`).
2. In **SQL Editor**, set role:

```sql
update public.profiles
set role = 'clinical', is_active = true, full_name = 'Nurse Practitioner'
where email = 'np@proinjury.local';
```

3. NP signs in at the same staff login URL (`/login`) and is redirected to **`/clinical`** (not the full CRM).

## Workflow

| Step | Where |
|------|--------|
| Patient intake (iPad) | `/portal` |
| NP consultation queue | `/clinical` |
| Per patient: NOFA, EMC, Initial report | `/clinical/cases/{caseId}` |

Documents are stored in `clinical_consultations` (`nofa_json`, `emc_json`, `initial_report_json`) until PDF templates are wired in.

## Follow-ups

Once a patient is treating, staff (case page → **NP follow-up** button) or the
therapist (`/therapy/cases/{id}` → **Send to NP follow-up**) can put the patient
back in the `/clinical` queue. The queue shows a gold **Follow-up** badge; the NP
updates forms as needed and presses **Mark follow-up complete**.

## Migrations

- `0020_clinical_portal.sql` — `clinical` role + `clinical_consultations` table
- `0022_clinical_followup.sql` — `visit_kind` + `followup_requested_at` (follow-up queue support)
- Paste files: `supabase/PASTE_IN_SQL_EDITOR_0020.sql`, `supabase/PASTE_IN_SQL_EDITOR_0022.sql`

## Reset practice case numbers

Admins: **Cases → Reset practice cases to #1** removes John Doe / iPad test patients and resets `case_seq_gen` so the next case is **1**.

Or run `supabase/PASTE_IN_SQL_RESET_PRACTICE.sql` in Supabase SQL Editor.
