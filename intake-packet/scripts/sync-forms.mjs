#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "intake-forms");

const sources = [
  process.env.INTAKE_FORMS_SOURCE,
  path.join(root, "..", "..", "MedicalCRM", "intake-forms"),
  "/mnt/c/Users/Stric/MedicalCRM/intake-forms",
  "C:\\Users\\Stric\\MedicalCRM\\intake-forms",
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
    "Could not find intake-forms. Set INTAKE_FORMS_SOURCE or copy MedicalCRM/intake-forms into intake-packet/intake-forms",
  );
  process.exit(1);
}
