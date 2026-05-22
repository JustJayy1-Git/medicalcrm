import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");

const REPLACEMENTS = [
  ["amber-950", "teal-950"],
  ["amber-900", "teal-900"],
  ["amber-800", "teal-800"],
  ["amber-700", "teal-700"],
  ["amber-600", "teal-600"],
  ["amber-500", "teal-500"],
  ["amber-400", "teal-400"],
  ["amber-300", "teal-300"],
  ["amber-200", "teal-200"],
  ["amber-100", "teal-100"],
  ["amber-50", "teal-50"],
  ["stone-950", "slate-950"],
  ["stone-900", "slate-900"],
  ["stone-800", "slate-800"],
  ["stone-700", "slate-700"],
  ["stone-600", "slate-600"],
  ["stone-500", "slate-500"],
  ["stone-400", "slate-400"],
  ["stone-300", "slate-300"],
  ["stone-200", "slate-200"],
  ["stone-100", "slate-100"],
  ["stone-50", "slate-50"],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx|ts|css)$/.test(name)) files.push(p);
  }
  return files;
}

let count = 0;
for (const file of walk(src)) {
  if (file.endsWith("globals.css")) continue;
  let s = fs.readFileSync(file, "utf8");
  const orig = s;
  for (const [from, to] of REPLACEMENTS) {
    s = s.split(from).join(to);
  }
  if (s !== orig) {
    fs.writeFileSync(file, s);
    count++;
  }
}
console.log(`Rethemed ${count} files (amber→teal, stone→slate)`);
