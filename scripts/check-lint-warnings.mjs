import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = path.join(root, "scripts/lint-warnings-baseline.json");
const currentBaseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

const eslint = new ESLint();
const results = await eslint.lintFiles(["src/**/*.{ts,tsx}"]);
const errors = results.reduce((total, result) => total + result.errorCount, 0);
const warnings = results.reduce((total, result) => total + result.warningCount, 0);

if (errors > 0) {
  console.error(`lint:baseline FAILED: ${errors} errors, ${warnings} warnings`);
  process.exit(1);
}

if (warnings !== currentBaseline.maxWarnings) {
  console.error(
    `lint:baseline FAILED: expected ${currentBaseline.maxWarnings} warnings, found ${warnings}`,
  );
  process.exit(1);
}

let mainBaseline = null;
const readMainBaseline = () => {
  try {
    const raw = execFileSync(
      "git",
      ["show", "origin/main:scripts/lint-warnings-baseline.json"],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

mainBaseline = readMainBaseline();
if (!mainBaseline) {
  try {
    execFileSync("git", ["fetch", "--no-tags", "--depth=1", "origin", "main"], {
      cwd: root,
      stdio: "ignore",
    });
    mainBaseline = readMainBaseline();
  } catch {
    mainBaseline = null;
  }
}

if (mainBaseline && currentBaseline.maxWarnings > mainBaseline.maxWarnings) {
  console.error(
    `lint:baseline FAILED: baseline cannot increase from ${mainBaseline.maxWarnings} to ${currentBaseline.maxWarnings}`,
  );
  process.exit(1);
}

console.log(`lint:baseline OK: 0 errors, ${warnings} warnings`);
