import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

if (!existsSync(".next/standalone/server.js")) {
  throw new Error("Missing .next/standalone/server.js. Run `next build` first.");
}

const copies = [
  ["public", ".next/standalone/public"],
  [".next/static", ".next/standalone/.next/static"],
];

for (const [from, to] of copies) {
  if (!existsSync(from)) {
    continue;
  }

  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true, force: true });
}
