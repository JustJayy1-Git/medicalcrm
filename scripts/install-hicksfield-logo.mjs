#!/usr/bin/env node
/**
 * Install the Hicksfield master logo (design/image.webp) as the brand source.
 *
 * The export has a fake transparency checkerboard baked in (flat ~rgb(198)
 * grey + ~rgb(254) white tiles, no alpha). We remove it by flood-filling
 * from the image borders across checkerboard-colored pixels only, so light
 * highlights inside the artwork are preserved. Then:
 *
 * - light set (logo-light*.png): cleaned art as-is (dark graphite wordmark).
 * - dark set (logo*.png): wordmark band luminance-inverted to light silver
 *   so "PRO INJURY" reads on the eggplant sidebar / dark headers.
 */
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "design", "image.webp");

const WORDMARK_START_RATIO = 0.78;

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;

function isNeutral(i) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  return Math.max(r, g, b) - Math.min(r, g, b) <= 10;
}

function isCheckerColor(i) {
  if (!isNeutral(i)) return false;
  const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
  // Tiles are ~198 grey and ~254 white, but webp compression smears the tile
  // borders across the whole 182-255 range, so accept any bright neutral.
  return v >= 182;
}

// Flood fill from all four borders across checkerboard-colored pixels.
const bg = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push(x, x + (height - 1) * width);
}
for (let y = 0; y < height; y++) {
  stack.push(y * width, y * width + width - 1);
}

while (stack.length) {
  const p = stack.pop();
  if (bg[p]) continue;
  if (!isCheckerColor(p * 4)) continue;
  bg[p] = 1;
  const x = p % width;
  const y = (p / width) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < width - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - width);
  if (y < height - 1) stack.push(p + width);
}

// Enclosed pockets (between snake coils, letter counters) are cut off from
// the borders, so also clear any remaining checker-colored component that is
// big enough to read as background. Small bright specks (scale/leaf
// highlights) stay untouched.
const MIN_POCKET_PX = 40;
const seen = new Uint8Array(width * height);
for (let start = 0; start < width * height; start++) {
  if (bg[start] || seen[start] || !isCheckerColor(start * 4)) continue;
  const component = [];
  const q = [start];
  seen[start] = 1;
  while (q.length) {
    const p = q.pop();
    component.push(p);
    const x = p % width;
    const y = (p / width) | 0;
    for (const n of [
      x > 0 ? p - 1 : -1,
      x < width - 1 ? p + 1 : -1,
      y > 0 ? p - width : -1,
      y < height - 1 ? p + width : -1,
    ]) {
      if (n >= 0 && !seen[n] && !bg[n] && isCheckerColor(n * 4)) {
        seen[n] = 1;
        q.push(n);
      }
    }
  }
  if (component.length >= MIN_POCKET_PX) {
    for (const p of component) bg[p] = 1;
  }
}

let removed = 0;
for (let p = 0; p < width * height; p++) {
  if (bg[p]) {
    data[p * 4 + 3] = 0;
    removed++;
  }
}

// Soften the 1px fringe where art meets removed background.
const alphaCopy = new Uint8Array(width * height);
for (let p = 0; p < width * height; p++) alphaCopy[p] = data[p * 4 + 3];
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const p = y * width + x;
    if (alphaCopy[p] === 0) continue;
    const nTransparent =
      (alphaCopy[p - 1] === 0) + (alphaCopy[p + 1] === 0) +
      (alphaCopy[p - width] === 0) + (alphaCopy[p + width] === 0);
    if (nTransparent >= 2 && isCheckerColor(p * 4)) {
      data[p * 4 + 3] = 90;
    }
  }
}

console.log(
  `Checkerboard removed: ${removed} px (${((removed / (width * height)) * 100).toFixed(1)}%)`,
);

async function writeSet(buf, names) {
  const master = sharp(Buffer.from(buf), {
    raw: { width, height, channels: 4 },
  }).png();
  for (const dir of ["public", "src/assets/brand", "design"]) {
    for (const { file, size } of names) {
      let img = master.clone();
      if (size) img = img.resize(size, size, { fit: "inside" });
      await img.toFile(path.join(root, dir, file));
    }
  }
}

// Light-surface set: cleaned art as-is (dark wordmark reads on white).
await writeSet(data, [
  { file: "logo-light.png", size: null },
  { file: "logo-light-header.png", size: 512 },
  { file: "logo-light-icon.png", size: 256 },
]);

// Dark-surface set: invert wordmark band to light silver, and lift the
// emblem's shadows so the near-black snakes stay visible on the eggplant
// sidebar.
const darkSet = Buffer.from(data);
const startRow = Math.floor(height * WORDMARK_START_RATIO);
for (let y = 0; y < height; y++) {
  const inWordmark = y >= startRow;
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (darkSet[i + 3] === 0) continue;
    for (let c = 0; c < 3; c++) {
      darkSet[i + c] = inWordmark
        ? 255 - darkSet[i + c]
        : Math.min(255, Math.round(darkSet[i + c] * 1.3 + 26));
    }
  }
}
await writeSet(darkSet, [
  { file: "logo.png", size: null },
  { file: "logo-header.png", size: 512 },
  { file: "logo-icon.png", size: 256 },
  { file: "logo-watermark.png", size: 800 },
]);

console.log("Installed Hicksfield logo sets in public/, src/assets/brand/, design/");
