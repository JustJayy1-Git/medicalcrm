#!/usr/bin/env node
/**
 * Rebuild brand logo variants from design/logo-source.png (black background):
 *
 * - Dark-surface set (logo.png / logo-header.png / logo-icon.png /
 *   logo-watermark.png): black matte stripped ONLY, so the white
 *   "PRO INJURY" wordmark survives (the old pipeline also stripped white,
 *   which erased the wordmark).
 * - Light-surface set (logo-light*.png): same, plus the wordmark band is
 *   remapped from white bevel to dark graphite metallic so it reads on
 *   white cards and print pages.
 */
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "design", "logo-source.png");

const BLACK = 50;
const FRINGE = 35;
const WORDMARK_START_RATIO = 0.7;

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

function stripBlackMatte(buf) {
  for (let i = 0; i < buf.length; i += 4) {
    const max = Math.max(buf[i], buf[i + 1], buf[i + 2]);
    if (max <= BLACK) {
      buf[i + 3] = 0;
    } else if (max <= BLACK + FRINGE) {
      const t = (BLACK + FRINGE - max) / FRINGE;
      buf[i + 3] = Math.round(buf[i + 3] * (1 - t));
    }
  }
}

function darkenWordmark(buf) {
  const startRow = Math.floor(info.height * WORDMARK_START_RATIO);
  for (let y = startRow; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (buf[i + 3] === 0) continue;
      for (let c = 0; c < 3; c++) {
        // White bevel -> graphite metallic (255 -> ~47, 180 -> ~92).
        buf[i + c] = Math.max(0, Math.min(255, Math.round(200 - 0.6 * buf[i + c])));
      }
    }
  }
}

async function writeSet(buf, names) {
  const master = sharp(Buffer.from(buf), {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();

  for (const dir of ["public", "src/assets/brand", "design"]) {
    for (const { file, size } of names) {
      let img = master.clone();
      if (size) img = img.resize(size, size, { fit: "inside" });
      await img.toFile(path.join(root, dir, file));
    }
  }
}

const darkSet = Buffer.from(data);
stripBlackMatte(darkSet);
await writeSet(darkSet, [
  { file: "logo.png", size: null },
  { file: "logo-header.png", size: 512 },
  { file: "logo-icon.png", size: 256 },
  { file: "logo-watermark.png", size: 800 },
]);

const lightSet = Buffer.from(darkSet);
darkenWordmark(lightSet);
await writeSet(lightSet, [
  { file: "logo-light.png", size: null },
  { file: "logo-light-header.png", size: 512 },
  { file: "logo-light-icon.png", size: 256 },
]);

console.log("Rebuilt dark + light logo sets in public/, src/assets/brand/, design/");
