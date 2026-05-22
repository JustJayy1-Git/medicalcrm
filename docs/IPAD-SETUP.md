# iPad kiosk setup — Pro Injury intake portal

Use this checklist when the intake iPad is charged and ready.

## 1. One-time server setup

```bash
cd ~/projects/medicalcrm
npm run sync-intake-forms
```

Apply migration **0015** (do **not** paste the file path into SQL Editor — that causes a syntax error):

**Option A — from terminal (recommended):**

```bash
npm run db:migrate-0015
```

Requires `SUPABASE_DB_PASSWORD` in `.env.local` (Supabase → Settings → Database).

**Option B — Supabase Dashboard → SQL → New query:** open `supabase/migrations/0015_kiosk_intake_packets.sql` in your editor, copy **all** SQL (starts with `-- Kiosk role`), paste into the query box, then Run.

Add to `.env.local`:

```env
KIOSK_EXIT_PIN=your-4-to-6-digit-pin
```

Restart `npm run dev` (or redeploy).

## 2. Create the kiosk user (Supabase)

1. **Authentication → Users → Add user**  
   - Email: e.g. `kiosk@proinjury.local`  
   - Password: strong password (you will save it in the iPad password field only)  
   - Auto-confirm email.

2. **SQL** (replace email):

```sql
update public.profiles
set role = 'kiosk', full_name = 'Front Desk iPad', is_active = true
where email = 'kiosk@proinjury.local';
```

## 3. iPad — Safari / PWA

1. Connect iPad to Wi‑Fi (same network as CRM, or production URL).
2. Open Safari → `https://<your-crm-host>/portal` (not `/login`)
3. **First time only (staff):** if prompted, sign in at `/portal/login` with the kiosk account, or set `KIOSK_DEVICE_EMAIL` + `KIOSK_DEVICE_PASSWORD` on Vercel so patients never see a login screen.
4. You should land on **`/portal`** with **Begin intake** (no CRM sidebar).
5. **Add to Home Screen** (Share → Add to Home Screen) — name it “Patient Intake”.
6. Open only from that home-screen icon going forward.

## 4. Lock the iPad (required)

Software alone cannot fully lock iOS. Use **Guided Access**:

1. **Settings → Accessibility → Guided Access** → On.  
2. Set a **Guided Access passcode** (different from `KIOSK_EXIT_PIN`).  
3. Open the intake PWA, triple-click the side button, start Guided Access.  
4. Disable touch for areas you don’t need (optional).  
5. To service the iPad: triple-click → enter Guided Access passcode.

**Staff exit from the app:** tap **Staff** (top right) → enter `KIOSK_EXIT_PIN` → signs out to login screen.

## 5. Daily use

| Step | Who |
|------|-----|
| Patient taps **Start intake** | Patient |
| Complete forms 01–08 (auto-save) | Patient |
| **Finish** on last page → **Start next patient** | Patient |
| Review packets in CRM → **Intake packets** | Staff |
| Link patient chart from packet detail | Staff |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “forms-manifest not found” | Run `npm run sync-intake-forms` on the server |
| Saves show “unsaved” | Kiosk session expired — sign in again at `/login` |
| iPad opens dashboard | Profile `role` must be `kiosk` |
| Cannot exit portal | Use **Staff** + PIN, or end Guided Access with hardware passcode |

See also `docs/INTAKE-KIOSK.md`.
