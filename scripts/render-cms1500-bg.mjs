/**
 * Renders page 1 of public/cms-1500-blank.pdf to PNG for HTML overlay preview.
 * Requires: npm install pdfjs-dist canvas (dev) — or use filled PDF only (default).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, "..", "public", "cms-1500-blank.pdf");
const outPath = path.join(__dirname, "..", "public", "cms-1500-blank-page1.png");

if (!fs.existsSync(pdfPath)) {
  console.error("Run npm run cms1500:copy-blank first.");
  process.exit(1);
}

try {
  const { createCanvas } = await import("canvas");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;
  const page = await doc.getPage(1);
  const scale = 300 / 72;
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("Wrote", outPath);
} catch (e) {
  console.warn(
    "Optional PNG render skipped (install canvas + pdfjs-dist for HTML overlay preview).",
    e.message,
  );
  console.warn("Filled PDF printing still works via /api/cms-1500/pdf");
  process.exit(0);
}
