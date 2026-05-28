#!/usr/bin/env node
/**
 * Install the official transparent brand logo.
 * Converts design/logo-source.png (PNG or JPEG) → true RGBA PNGs in public/ + src/assets/brand/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "design", "logo-source.png");

const WHITE = 235;
const BLACK = 50;

async function toTransparentPng(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    // White matte (common JPEG "no background" export)
    if (min >= WHITE) {
      data[i + 3] = 0;
      continue;
    }
    // Black matte
    if (max <= BLACK) {
      data[i + 3] = 0;
      continue;
    }
    // Soft fringe on white
    if (min >= WHITE - 35) {
      const t = (WHITE - min) / 35;
      data[i + 3] = Math.round(data[i + 3] * (1 - t));
    }
    // Soft fringe on black
    else if (max <= BLACK + 35) {
      const t = (BLACK + 35 - max) / 35;
      data[i + 3] = Math.round(data[i + 3] * (1 - t));
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}

if (!fs.existsSync(source)) {
  console.error("Missing design/logo-source.png");
  process.exit(1);
}

const names = ["logo.png", "logo-header.png", "logo-icon.png", "logo-watermark.png"];
const dirs = [path.join(root, "public"), path.join(root, "src/assets/brand")];

fs.mkdirSync(path.join(root, "design"), { recursive: true });

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  for (const name of names) {
    await toTransparentPng(source, path.join(dir, name));
  }
}

// Keep design/ variants in sync (true PNG)
for (const name of names) {
  await toTransparentPng(source, path.join(root, "design", name));
}

console.log(`Installed transparent PNG logo → ${dirs.length + 1} folders × ${names.length} files`);
