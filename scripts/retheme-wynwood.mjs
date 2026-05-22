import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");

/** teal/slate → Wynwood vice palette */
const REPLACEMENTS = [
  ["from-teal-400 to-teal-600", "from-neon-pink to-neon-mint"],
  ["from-teal-300 to-teal-500", "from-neon-pink to-neon-mint"],
  ["hover:from-teal-300 hover:to-teal-500", "hover:brightness-110"],
  ["hover:from-amber-300 hover:to-amber-500", "hover:brightness-110"],
  ["from-amber-400 to-amber-600", "from-neon-pink to-neon-mint"],
  ["from-amber-300 to-amber-500", "from-neon-pink to-neon-mint"],
  ["teal-950", "eggplant-950"],
  ["teal-900", "eggplant-900"],
  ["teal-800", "eggplant-800"],
  ["teal-700", "neon-pink"],
  ["teal-600", "neon-mint"],
  ["teal-500", "neon-mint"],
  ["teal-400", "neon-mint"],
  ["teal-300", "neon-mint-200"],
  ["teal-200", "neon-mint-100"],
  ["teal-100", "neon-mint-100"],
  ["teal-50", "neon-mint-100"],
  ["slate-950", "eggplant-950"],
  ["slate-900", "eggplant-900"],
  ["slate-800", "eggplant-900"],
  ["slate-700", "eggplant-800"],
  ["slate-600", "eggplant-700"],
  ["slate-500", "vice-muted"],
  ["slate-400", "vice-muted"],
  ["slate-300", "vice-border"],
  ["slate-200", "vice-border"],
  ["slate-100", "neon-mint-100"],
  ["slate-50", "vice-surface"],
  ["ring-teal-500/40", "ring-neon-mint/40"],
  ["ring-teal-500", "ring-neon-mint"],
  ["border-teal-500", "border-neon-mint"],
  ["border-teal-600", "border-neon-mint"],
  ["border-teal-200", "border-neon-mint/30"],
  ["border-teal-300", "border-neon-mint/40"],
  ["text-teal-800", "text-eggplant-900"],
  ["bg-teal-500", "bg-neon-pink"],
  ["shadow-teal-900/30", "shadow-neon-pink/30"],
  ["amber-950", "eggplant-950"],
  ["amber-900", "eggplant-900"],
  ["amber-800", "neon-pink"],
  ["amber-700", "neon-pink"],
  ["amber-600", "neon-mint"],
  ["amber-500", "neon-mint"],
  ["amber-400", "neon-mint"],
  ["amber-300", "neon-mint-200"],
  ["amber-200", "neon-mint-100"],
  ["amber-100", "neon-mint-100"],
  ["amber-50", "neon-mint-100"],
  ["stone-950", "eggplant-950"],
  ["stone-900", "eggplant-900"],
  ["stone-800", "eggplant-900"],
  ["stone-700", "eggplant-800"],
  ["stone-600", "eggplant-700"],
  ["stone-500", "vice-muted"],
  ["stone-400", "vice-muted"],
  ["stone-300", "vice-border"],
  ["stone-200", "vice-border"],
  ["stone-100", "neon-mint-100"],
  ["stone-50", "vice-surface"],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx|ts|css)$/.test(name) && !name.includes("globals.css")) files.push(p);
  }
  return files;
}

let count = 0;
for (const file of walk(src)) {
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
console.log(`Wynwood retheme: ${count} files`);
