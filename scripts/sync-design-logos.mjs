#!/usr/bin/env node
/**
 * Copy transparent logo PNGs from design/ into public/.
 * Run: npm run sync-design-logos
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "public");

const sources = [
  path.join(root, "design"),
  process.env.DESIGN_ASSETS_SOURCE,
  "/mnt/c/Users/Stric/MedicalCRM/design",
  path.join("C:", "Users", "Stric", "MedicalCRM", "design"),
].filter(Boolean);

const files = ["logo.png", "logo-header.png", "logo-watermark.png", "logo-icon.png"];

function copyIfExists(srcDir) {
  let copied = 0;
  for (const name of files) {
    const src = path.join(srcDir, name);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(dest, name));
    console.log(`Copied ${name} from ${srcDir}`);
    copied++;
  }
  return copied;
}

let total = 0;
for (const src of sources) {
  if (!fs.existsSync(src)) continue;
  total += copyIfExists(src);
}

if (total === 0) {
  const stub = path.join(dest, "logo-emblem.png");
  if (fs.existsSync(stub)) {
    for (const name of files) {
      if (name === "logo.png" && fs.existsSync(path.join(dest, name))) continue;
      fs.copyFileSync(stub, path.join(dest, name));
      console.log(`Stub ${name} from logo-emblem.png (add transparent PNGs to design/)`);
      total++;
    }
  }
}

if (total === 0) {
  console.error(
    "No logo PNGs found. Add logo-header.png (transparent) to design/ per design/LOGO.md, then re-run.",
  );
  process.exit(1);
}

console.log(`Done — ${total} file(s) in public/`);
