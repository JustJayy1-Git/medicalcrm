# Deploy MedicalCRM (live on the internet)

Your database and auth already live in **Supabase cloud**. Hosting the Next.js app on **Vercel** + code on **GitHub** is the fastest path off localhost.

## Overview

| Piece | Service | You already have |
|-------|---------|------------------|
| App (Next.js) | [Vercel](https://vercel.com) | Connect GitHub repo |
| Database + Auth | [Supabase](https://supabase.com) | Yes — same project as `.env.local` |
| Custom domain | Vercel + your registrar | Optional (e.g. `crm.proinjury.com`) |

---

## Before you deploy (required once)

Vercel cannot read forms from your PC’s `C:\Users\Stric\MedicalCRM\` folder. The **8 HTML intake forms** must be **inside the Git repo**.

From WSL in the Next.js project (`~/projects/medicalcrm`):

```bash
cd ~/projects/medicalcrm
npm run sync-intake-forms    # copies from C:\Users\Stric\MedicalCRM\intake-forms
ls intake-forms/forms        # must list intake.html … records.html
npm run build                # fix any errors before Vercel sees them
```

Also commit the CMS-1500 blank PDF if you use claim printing:

```bash
npm run cms1500:copy-blank
git add public/cms-1500-blank.pdf intake-forms/
```

---

## Step 1 — Push code to GitHub

From WSL in the project folder:

```bash
cd ~/projects/medicalcrm

# First time only: create repo on GitHub (browser or CLI)
# GitHub.com → New repository → name: medicalcrm → Private → Create

git add -A
git status   # confirm .env.local is NOT listed; DO see intake-forms/forms/*.html
git commit -m "Prepare for production deployment"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USER/medicalcrm.git
git push -u origin main
```

If `git remote add` fails because `origin` exists:

```bash
git remote set-url origin https://github.com/YOUR_GITHUB_USER/medicalcrm.git
git push -u origin main
```

**Never commit** `.env.local` — it is in `.gitignore`.

---

## Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with **GitHub**.
2. **Add New Project** → Import `medicalcrm` repository.
3. Framework: **Next.js** (auto-detected).
4. **Environment Variables** — add these for **Production** (and Preview if you want):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API → publishable key |
   | `SUPABASE_SECRET_KEY` | Supabase → API → secret key (server only) |
   | `KIOSK_EXIT_PIN` | 4–6 digit PIN for **Staff** exit on iPad portal |
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel URL after first deploy, e.g. `https://medicalcrm-xxx.vercel.app` |

   Optional CMS-1500 / practice (if you use them locally, add the same names):

   - `NEXT_PUBLIC_PRACTICE_NAME`, `NEXT_PUBLIC_PRACTICE_NPI`, `NEXT_PUBLIC_PRACTICE_PHONE`, etc.

5. Confirm the repo includes **`intake-forms/forms/*.html`** and **`public/cms-1500-blank.pdf`** (if using claims).

6. Click **Deploy**. You get a URL like `https://medicalcrm-xxx.vercel.app`.

---

## Step 3 — Tell Supabase about your live URL (after first deploy)

In **Supabase Dashboard** → **Authentication** → **URL configuration**:

1. **Site URL** — your live app URL, e.g. `https://medicalcrm-xxx.vercel.app` or your custom domain.
2. **Redirect URLs** — add:
   - `https://medicalcrm-xxx.vercel.app/**`
   - `https://your-custom-domain.com/**` (when you add one)

Save. Without this, login works on localhost but fails in production.

---

## Step 4 — Custom domain (optional)

1. Vercel → your project → **Settings** → **Domains**.
2. Add e.g. `crm.proinjury.com`.
3. At your domain registrar (GoDaddy, Cloudflare, etc.), add the DNS records Vercel shows (usually a CNAME).
4. Update Supabase **Site URL** and **Redirect URLs** to the custom domain.

SSL is automatic on Vercel.

---

## Step 5 — Create logins (staff + iPad kiosk)

Supabase → **Authentication** → **Users** → **Add user** for each person.

| User | Purpose | After creating user, run SQL |
|------|---------|------------------------------|
| You + coworkers | Full CRM | Default role `staff` (or `admin` for you) |
| `kiosk@proinjury.local` (example) | iPad intake only | `update public.profiles set role = 'kiosk', is_active = true where email = 'kiosk@proinjury.local';` |

Do not share one login. Kiosk users only see `/portal`, not billing or patients list.

---

## Step 6 — iPad (uses your Vercel URL)

1. iPad **Safari** → `https://YOUR-VERCEL-URL.vercel.app/login`
2. Sign in as **kiosk** user → lands on `/portal`
3. **Share → Add to Home Screen** → name **Patient Intake**
4. **Settings → Accessibility → Guided Access** → On → start Guided Access on the home-screen app

Full detail: [IPAD-SETUP.md](./IPAD-SETUP.md) (use your Vercel URL everywhere it says localhost).

Staff on computers: same URL, sign in with **staff** accounts → full CRM.

---

## After deploy

- Every `git push` to `main` can auto-redeploy (Vercel default).
- Data entered on the live site uses the **same Supabase project** as local — if you use the same env keys.
- Run any new SQL migrations in Supabase **SQL Editor** (same as local).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Vercel | Check deploy logs; run `npm run build` locally in WSL |
| Login loops or 401 | Supabase Site URL + Redirect URLs must match live domain |
| Blank page | Verify all three Supabase env vars on Vercel |
| “Both middleware and proxy” error | Only `src/proxy.ts` should exist — not `middleware.ts` |
| CMS-1500 “blank form not installed” | Commit `public/cms-1500-blank.pdf` to GitHub |
| Intake forms blank / “manifest not found” on Vercel | Run `npm run sync-intake-forms`, commit `intake-forms/` to GitHub, redeploy |
| iPad **Staff** exit fails | Set `KIOSK_EXIT_PIN` on Vercel → Redeploy |

---

## HIPAA note

Before putting real PHI in production: confirm **RLS** on all tables, use **HTTPS only**, restrict Supabase dashboard access, and document who has logins. This guide gets you **online**; compliance is a separate checklist.
