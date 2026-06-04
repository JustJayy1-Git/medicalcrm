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

## Migrations

- `0020_clinical_portal.sql` — `clinical` role + `clinical_consultations` table
- Paste file: `supabase/PASTE_IN_SQL_EDITOR_0020.sql` (copy SQL only, not the path)

## Reset practice case numbers

Admins: **Cases → Reset practice cases to #1** removes John Doe / iPad test patients and resets `case_seq_gen` so the next case is **1**.

Or run `supabase/PASTE_IN_SQL_RESET_PRACTICE.sql` in Supabase SQL Editor.
