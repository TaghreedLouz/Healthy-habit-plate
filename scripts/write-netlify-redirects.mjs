import { readFileSync, writeFileSync, existsSync } from "node:fs";

const root = "dist/_redirects";
const client = "dist/client/_redirects";
const rule = "/* /.netlify/functions/server 200\n";

for (const file of [root, client]) {
  if (!existsSync(file) || readFileSync(file, "utf8").trim().length === 0) {
    writeFileSync(file, rule);
  }
}
