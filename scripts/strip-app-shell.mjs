import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "src", "app");

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const authBlock =
  /\n\s*const \{\s*data: \{ user \},\s*\} = await supabase\.auth\.getUser\(\);\s*\n\s*if \(!user\) redirect\("\/login"\);\s*/g;

for (const file of walk(appDir)) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes("AppShell")) continue;

  s = s.replace(/import \{ AppShell \} from "@\/components\/app-shell";\n/, "");
  s = s.replace(authBlock, "\n");
  s = s.replace(/<AppShell user=\{user\} active=\{[^}]+\}>\s*/g, "");
  s = s.replace(/<AppShell user=\{user\} active="[^"]*">\s*/g, "");
  s = s.replace(/\s*<\/AppShell>\s*/g, "\n");
  fs.writeFileSync(file, s);
  console.log("stripped", path.relative(root, file));
}
