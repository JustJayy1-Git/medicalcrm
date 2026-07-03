# Pro Injury — Official Logo Assets

**Use these. Do not generate or invent new ones.**

The original source (`IMG_2731...png`) shipped on a solid black background.
These files have that background stripped to **transparent alpha** so the
logo can be placed on any color surface (light cards, dark headers, print)
without a black box around it.

## Files

| File | Size (max) | Use |
| ---- | ---------- | --- |
| `logo.png`           | full-res (~original) | Master asset (dark surfaces — white wordmark). |
| `logo-header.png`    | 512px        | App header / nav bar / web header (dark surfaces). |
| `logo-watermark.png` | 800px        | Page watermarks, intake landing hero, print backgrounds. |
| `logo-icon.png`      | 256px        | Favicon, small tile, sidebar icon. |
| `logo-light.png`     | full-res     | Light-surface master — graphite wordmark. |
| `logo-light-header.png` | 512px     | Light cards & print letterheads (attorney ledger, A/R aging, charge summary). |
| `logo-light-icon.png`   | 256px     | Small light-surface placements. |

All are **transparent PNGs** (RGBA). No black background.

**Master source: `design/image.webp`** — Hicksfield high-detail render
(realistic snakes/spine/wreath, dark metallic wordmark, fake-transparency
checkerboard baked in). Rebuild all variants with:

```bash
node scripts/install-hicksfield-logo.mjs
```

(Removes the checkerboard, emits the light set as-is, and derives the dark
set by inverting the wordmark band + lifting emblem shadows.)

Legacy flat render: `design/logo-source.png` (`scripts/make-logo-light.mjs`).

In React use `<LogoMark tone="dark" | "light" …>` (`src/components/logo-mark.tsx`).

## Where it's used (canonical references)

- **LUKARIENZ CRM** sidebar + login: `logo-icon.png` or `logo-header.png` from `/public/` (synced via `npm run sync-design-logos`).
- **Patient portal** landing (`/portal`): `logo-header.png` — no background box; blends on dark gradient.
- Intake print templates: `logo-watermark.png` for header marks.

## Sync into this repo

```bash
npm run sync-design-logos
```

Copies PNGs from `design/` (this folder) or `C:\Users\Stric\MedicalCRM\design\` into `public/`, then strips opaque black matte via `strip-logo-background.mjs`.

```bash
npm run sync-design-logos   # copy + strip
npm run strip-logo-background   # re-strip existing public/ + design/ PNGs
```

## Deprecated

- `logo-header.jpg`, `logo-mono.jpg` — no transparency. **Do not use** for web headers.

Brand mark: caduceus with vertical spine inside a laurel wreath +
"PRO INJURY" wordmark. Silver/grayscale on transparent.
