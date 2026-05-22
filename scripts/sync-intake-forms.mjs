#!/usr/bin/env node
/**
 * Copy Archie intake-forms into this repo (required for Vercel deploy).
 * Run from project root: npm run sync-intake-forms
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "intake-forms");

const sources = [
  process.env.INTAKE_FORMS_SOURCE,
  path.join(root, "intake-packet", "intake-forms"),
  "/mnt/c/Users/Stric/MedicalCRM/intake-forms",
  path.join("C:", "Users", "Stric", "MedicalCRM", "intake-forms"),
].filter(Boolean);

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dst, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

let copied = false;
for (const src of sources) {
  if (!src || !fs.existsSync(path.join(src, "forms", "intake.html"))) continue;
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
  copyDir(src, dest);
  console.log(`Copied intake-forms from ${src}`);
  copied = true;
  break;
}

if (!copied) {
  console.error(
    "Could not find intake-forms. Set INTAKE_FORMS_SOURCE or ensure C:\\Users\\Stric\\MedicalCRM\\intake-forms exists.",
  );
  process.exit(1);
}
