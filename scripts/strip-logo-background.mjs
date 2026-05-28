#!/usr/bin/env node
/**
 * Remove black matte from logo PNGs (global chroma-key + edge flood-fill).
 * Writes to public/, design/, and src/assets/brand/ (bundled with app).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY_THRESHOLD = 55;
const FEATHER = 45;

const FILES = ["logo.png", "logo-header.png", "logo-watermark.png", "logo-icon.png"];

function isMatte(r, g, b, a) {
  return a > 0 && Math.max(r, g, b) <= KEY_THRESHOLD;
}

function stripBlackMatte(inputPath) {
  const png = PNG.sync.read(fs.readFileSync(inputPath));
  const { width, height, data } = png;

  // 1) Global chroma-key — logo art is silver/white; matte is near-black everywhere.
  let keyed = 0;
  for (let p = 0; p < data.length; p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const max = Math.max(r, g, b);
    if (max <= KEY_THRESHOLD) {
      data[p + 3] = 0;
      keyed++;
    } else if (max <= KEY_THRESHOLD + FEATHER) {
      const t = (max - KEY_THRESHOLD) / FEATHER;
      data[p + 3] = Math.round(data[p + 3] * t);
    }
  }

  // 2) Edge flood-fill catches any remaining dark fringe connected to borders.
  const visited = new Uint8Array(width * height);
  const queue = [];
  function push(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const p = i * 4;
    if (!isMatte(data[p], data[p + 1], data[p + 2], data[p + 3])) return;
    visited[i] = 1;
    queue.push(i);
  }
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (queue.length) {
    const i = queue.shift();
    const x = i % width;
    const y = (i - x) / width;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  for (let i = 0; i < width * height; i++) {
    if (!visited[i]) continue;
    data[i * 4 + 3] = 0;
  }

  return PNG.sync.write(png);
}

function writeAll(name, buffer) {
  const dirs = [
    path.join(root, "public"),
    path.join(root, "design"),
    path.join(root, "src/assets/brand"),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buffer);
  }
}

function sourceFor(name) {
  const candidates = [
    path.join(root, "design", name),
    "/mnt/c/Users/Stric/MedicalCRM/design/" + name,
    path.join(root, "public", name),
    path.join(root, "src/assets/brand", name),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

let total = 0;
for (const name of FILES) {
  const src = sourceFor(name);
  if (!src) {
    console.warn(`Skip ${name} — source not found`);
    continue;
  }
  const out = stripBlackMatte(src);
  writeAll(name, out);
  console.log(`Processed ${name} (from ${src})`);
  total++;
}

// Strip legacy fallback emblem too
const emblemSrc = fs.existsSync(path.join(root, "public", "logo-emblem.png"))
  ? path.join(root, "public", "logo-emblem.png")
  : null;
if (emblemSrc) {
  const out = stripBlackMatte(emblemSrc);
  fs.writeFileSync(emblemSrc, out);
  console.log("Processed logo-emblem.png (fallback)");
}

if (total === 0) {
  const bundled = path.join(root, "src/assets/brand/logo-header.png");
  if (fs.existsSync(bundled)) {
    console.log("No source PNGs to strip — using bundled src/assets/brand/");
    process.exit(0);
  }
  console.error("No logo PNGs found. Add files to design/ per design/LOGO.md");
  process.exit(1);
}

console.log(`Done — ${total} logo(s) in public/, design/, src/assets/brand/`);
