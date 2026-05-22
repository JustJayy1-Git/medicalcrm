import fs from "fs";
import path from "path";

export function resolveFormsDir(): string {
  const candidates = [
    path.join(process.cwd(), "intake-forms", "forms"),
    path.join(process.cwd(), "..", "intake-forms", "forms"),
    "/mnt/c/Users/Stric/MedicalCRM/intake-forms/forms",
    path.join("C:", "Users", "Stric", "MedicalCRM", "intake-forms", "forms"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "intake.html"))) return dir;
  }
  throw new Error(
    "intake-forms not found. Run: npm run sync-forms (from intake-packet/)",
  );
}
