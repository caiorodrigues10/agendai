#!/usr/bin/env node
/**
 * Gate local de entrega (sem produção).
 * Uso: npm run verify:delivery
 */
import { spawnSync } from "node:child_process";

const steps = [
  ["docs:check", ["run", "docs:check"]],
  ["typecheck", ["run", "typecheck"]],
  ["test:contract", ["run", "test:contract"]],
  ["contract:check", ["run", "contract:check"]],
  ["test", ["test"]],
];

for (const [label, args] of steps) {
  console.log(`\n==> ${label}`);
  const result = spawnSync("npm", args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`verify:delivery FAILED at ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nverify:delivery OK (frontend)");
