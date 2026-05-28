# Pro Injury — Official Logo Assets

**Use these. Do not generate or invent new ones.**

The original source (`IMG_2731...png`) shipped on a solid black background.
These files have that background stripped to **transparent alpha** so the
logo can be placed on any color surface (light cards, dark headers, print)
without a black box around it.

## Files

| File | Size (max) | Use |
| ---- | ---------- | --- |
| `logo.png`           | full-res (~original) | Master asset. Source of truth. Use this if you need to re-render at any size. |
| `logo-header.png`    | 512px        | App header / nav bar / web header. |
| `logo-watermark.png` | 800px        | Page watermarks, intake landing hero, print backgrounds. |
| `logo-icon.png`      | 256px        | Favicon, small tile, sidebar icon. |

All four are **transparent PNGs** (RGBA). No black background.

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
