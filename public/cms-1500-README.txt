Your blank CMS-1500 (required for exact-form printing)
======================================================

Source file (your PC):
  C:\Users\Stric\Desktop\CMS1500.pdf

Install into this project:
  npm run cms1500:copy-blank

That copies to:
  public/cms-1500-blank.pdf

The app draws claim data on page 1 of that PDF (pdf-lib) so prints match
your blank form. Page 2 (instructions) is not used.

Optional HTML preview background:
  npm run cms1500:render-bg
  → public/cms-1500-blank-page1.png

If a field prints slightly off your scan, tell us which box number and we
adjust coordinates in src/lib/cms1500/coordinates.ts
