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
| Consultation packet (intake-style paper docs) | `/clinical/cases/{caseId}/docs/{slug}` |

The consultation is an **intake-style document packet** matching the patient
iPad intake look: one paper document per page with Save & next pagination and
per-document pills (No-Fault → EMC → Initial report → Follow-up). Paper
primitives: `src/components/clinical/paper-doc.tsx`; document bodies:
`src/components/clinical/docs.tsx`; order/titles: `src/lib/clinical/doc-slugs.ts`.

Documents are stored in `clinical_consultations` (`nofa_json`, `emc_json`,
`initial_report_json`, `followup_json`) with per-document `*_completed_at`.
Completing the follow-up note also clears the follow-up from the queue.

## Follow-ups

Once a patient is treating, staff (case page → **NP follow-up** button) or the
therapist (`/therapy/cases/{id}` → **Send to NP follow-up**) can put the patient
back in the `/clinical` queue. The queue shows a gold **Follow-up** badge; the NP
updates forms as needed and presses **Mark follow-up complete**.

## Migrations

- `0020_clinical_portal.sql` — `clinical` role + `clinical_consultations` table
- `0022_clinical_followup.sql` — `visit_kind` + `followup_requested_at` (follow-up queue support)
- `0023_clinical_followup_doc.sql` — `followup_json` + `followup_completed_at` (follow-up SOAP document)
- Paste files: `supabase/PASTE_IN_SQL_EDITOR_0020.sql`, `..._0022.sql`, `..._0023.sql`

## Reset practice case numbers

Admins: **Cases → Reset practice cases to #1** removes John Doe / iPad test patients and resets `case_seq_gen` so the next case is **1**.

Or run `supabase/PASTE_IN_SQL_RESET_PRACTICE.sql` in Supabase SQL Editor.
