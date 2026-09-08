#!/usr/bin/env node
/**
 * Verificador documental — frontend (agendai)
 * Sem dependências novas. Modo checagem: exit 1 se falhar.
 *
 * Uso: node scripts/check-docs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const entryFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  ".github/copilot-instructions.md",
  "docs/agents/PACKAGES.md",
  "docs/agents/SCRIPTS.md",
  "docs/agents/STRUCTURE.md",
  "docs/agents/DOMAIN_MAP.md",
  "docs/agents/BUSINESS_RULES.md",
  "docs/agents/ARCHITECTURE.md",
  "docs/agents/GRAPHIFY.md",
];

for (const f of entryFiles) {
  if (!exists(f)) errors.push(`Arquivo obrigatório ausente: ${f}`);
}

const pkg = JSON.parse(read("package.json"));
const packagesMd = exists("docs/agents/PACKAGES.md") ? read("docs/agents/PACKAGES.md") : "";
const scriptsMd = exists("docs/agents/SCRIPTS.md") ? read("docs/agents/SCRIPTS.md") : "";

for (const section of ["dependencies", "devDependencies"]) {
  for (const name of Object.keys(pkg[section] || {})) {
    if (!packagesMd.includes(`\`${name}\``)) {
      errors.push(`Pacote não catalogado em PACKAGES.md: ${name}`);
    }
  }
}

for (const name of Object.keys(pkg.scripts || {})) {
  if (!scriptsMd.includes(`\`${name}\``)) {
    errors.push(`Script não catalogado em SCRIPTS.md: ${name}`);
  }
}

const agents = exists("AGENTS.md") ? read("AGENTS.md") : "";
const linkRe = /\[[^\]]*\]\((\.\/[^)]+|docs\/[^)]+|AGENTS\.md|CLAUDE\.md|GEMINI\.md)\)/g;
let m;
while ((m = linkRe.exec(agents)) !== null) {
  let target = m[1].split("#")[0];
  if (target.startsWith("./")) target = target.slice(2);
  if (!exists(target)) errors.push(`Link quebrado em AGENTS.md: ${m[1]}`);
}

const inventoryFiles = entryFiles.filter((f) => f.startsWith("docs/agents/"));
for (const file of inventoryFiles) {
  if (!exists(file)) continue;
  const text = read(file);
  const localLinks = text.matchAll(/\[[^\]]*\]\(([^http)][^)]*)\)/g);
  for (const hit of localLinks) {
    let target = hit[1].split("#")[0];
    if (!target || target.startsWith("mailto:")) continue;
    if (target.startsWith("../")) {
      const resolved = path.normalize(path.join(path.dirname(path.join(root, file)), target));
      if (!fs.existsSync(resolved)) errors.push(`Link quebrado em ${file}: ${hit[1]}`);
      continue;
    }
    if (target.startsWith("./")) target = target.slice(2);
    const fromDocs = path.join(path.dirname(file), target);
    if (!exists(target) && !exists(fromDocs)) {
      // ignore anchors-only and external-ish
      if (!target.includes("/")) continue;
    }
  }
}

if (errors.length) {
  console.error("docs:check FAILED\n");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log("docs:check OK (frontend)");
