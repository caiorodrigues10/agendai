#!/usr/bin/env node
/**
 * Relatório de precache do PWA (item P1 da auditoria de LCP).
 *
 * Lê o `precacheAndRoute([...])` gerado no `dist/sw.js` e imprime:
 *   - total de itens e bytes;
 *   - agrupamento por tipo (js/css/fonte/img/html/outros);
 *   - os maiores itens;
 *   - comparação opcional com o limite via `--limit=<bytes>`
 *     (exit code 1 quando estoura — mesmo papel do gate de chunks >500 kB).
 *
 * Uso:
 *   node scripts/precache-report.mjs --limit=3185427 [--json]
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice(8)) : null;
const asJson = args.includes('--json');

const swPath = path.resolve('dist/sw.js');
if (!fs.existsSync(swPath)) {
  console.error('dist/sw.js não encontrado — rode `npm run build` antes.');
  process.exit(1);
}

const source = fs.readFileSync(swPath, 'utf8');
const match = source.match(/precacheAndRoute\(\[(.*?)\]/s);
if (!match) {
  console.error('precacheAndRoute(...) não encontrado em dist/sw.js');
  process.exit(1);
}

const entries = [...match[1].matchAll(/url:\s*"([^"]+)"[^}]*?(?:revision[^,}]*)?/g)].map(m => m[1]);
const withSize = entries.map(rel => {
  const file = path.resolve('dist', rel.replace(/^\//, ''));
  const bytes = fs.existsSync(file) ? fs.statSync(file).size : 0;
  return { url: rel, bytes };
});

const kindOf = url => {
  if (/\.(js|mjs)$/.test(url)) return 'js';
  if (/\.css$/.test(url)) return 'css';
  if (/\.woff2?$/.test(url)) return 'fonte';
  if (/\.(png|jpg|jpeg|svg|webp|avif|ico)$/.test(url)) return 'img';
  if (/\.html?$/.test(url)) return 'html';
  if (/webmanifest$/.test(url)) return 'manifest';
  return 'outros';
};

const groups = {};
for (const item of withSize) {
  const kind = kindOf(item.url);
  groups[kind] = groups[kind] || { count: 0, bytes: 0 };
  groups[kind].count += 1;
  groups[kind].bytes += item.bytes;
}

const totalBytes = withSize.reduce((sum, item) => sum + item.bytes, 0);
const biggest = [...withSize].sort((a, b) => b.bytes - a.bytes).slice(0, 15);
const mb = bytes => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

if (asJson) {
  console.log(
    JSON.stringify(
      { total: totalBytes, count: withSize.length, groups, biggest, limit, ok: limit === null || totalBytes <= limit },
      null,
      2
    )
  );
} else {
  console.log(`Precache: ${withSize.length} itens · ${mb(totalBytes)} (${totalBytes} bytes)`);
  console.log('');
  console.log('| tipo | itens | bytes | MB |');
  console.log('|---|---:|---:|---:|');
  for (const [kind, info] of Object.entries(groups).sort((a, b) => b[1].bytes - a[1].bytes)) {
    console.log(`| ${kind} | ${info.count} | ${info.bytes.toLocaleString('pt-BR')} | ${mb(info.bytes)} |`);
  }
  console.log('');
  console.log('Maiores itens:');
  for (const item of biggest) {
    console.log(`  ${String(item.bytes).padStart(9)}  ${item.url}`);
  }
  if (limit !== null) {
    console.log('');
    console.log(
      totalBytes <= limit
        ? `OK: ${totalBytes} ≤ limite ${limit}`
        : `ESTOUROU: ${totalBytes} > limite ${limit}`
    );
  }
}

if (limit !== null && totalBytes > limit) process.exit(1);
