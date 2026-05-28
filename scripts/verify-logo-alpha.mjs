#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = [];

for (const f of ["public/logo-header.png", "public/logo-icon.png"]) {
  const file = path.join(root, f);
  if (!fs.existsSync(file)) {
    out.push(`${f}: MISSING`);
    continue;
  }
  const p = PNG.sync.read(fs.readFileSync(file));
  const corners = [
    [0, 0],
    [p.width - 1, 0],
    [0, p.height - 1],
    [p.width - 1, p.height - 1],
  ];
  out.push(f + ":");
  for (const [x, y] of corners) {
    const i = (y * p.width + x) * 4;
    out.push(`  corner ${x},${y} RGBA ${p.data.slice(i, i + 4).join(",")}`);
  }
  let transparent = 0;
  for (let i = 3; i < p.data.length; i += 4) {
    if (p.data[i] < 128) transparent++;
  }
  out.push(`  transparent pixels: ${transparent}/${p.width * p.height}`);
}

fs.writeFileSync(path.join(root, "logo-strip-verify.txt"), out.join("\n") + "\n");
console.log(out.join("\n"));
