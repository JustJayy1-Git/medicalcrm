import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sources = [
  "C:/Users/Stric/Desktop/CMS1500.pdf",
  "/mnt/c/Users/Stric/Desktop/CMS1500.pdf",
];
const dest = path.join(root, "public", "cms-1500-blank.pdf");

for (const src of sources) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log("Copied", src, "->", dest, fs.statSync(dest).size, "bytes");
    process.exit(0);
  }
}
console.error("CMS1500.pdf not found. Place it at:", dest);
process.exit(1);
