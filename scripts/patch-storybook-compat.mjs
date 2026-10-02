/**
 * Patches de compatibilidade (idempotentes) aplicados via `postinstall`.
 * Remover cada um quando a issue upstream correspondente for corrigida.
 *
 * 1. @storybook/addon-vitest — paths não-ASCII (storybookjs/storybook#36045):
 *    `convertToFilePath` só decodificava `%20`, então o guard
 *    `convertToFilePath(import.meta.url).includes(testPath)` nunca casava em
 *    paths como "Programação" e o Vitest reportava "No test suite found".
 *
 * 2. storybook core — module.register dentro do Jest (storybookjs/storybook#36116):
 *    com jest >= 30.5, `register()` lança dentro do sandbox; o chamava sem
 *    try/catch ANTES do fallback import/require, derrubando todos os suites do
 *    test-runner quando existe `.storybook/test-runner.*`. Fix sugerido na issue:
 *    envolver em try/catch e deixar o transform do próprio Jest lidar com o TS.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunksDir = path.join(root, 'node_modules', 'storybook', 'dist', '_node-chunks');

function patchAddonVitest() {
  const target = path.join(root, 'node_modules', '@storybook', 'addon-vitest', 'dist', 'vitest-plugin', 'test-utils.js');
  const OLD = String.raw`var convertToFilePath = (url) => url.replace(/^file:\/\//, "").replace(/^\/+([a-zA-Z]:)/, "$1").replace(/%20/g, " ")`;
  const NEW = String.raw`var convertToFilePath = (url) => { const p = url.replace(/^file:\/\//, "").replace(/^\/+([a-zA-Z]:)/, "$1"); try { return decodeURIComponent(p); } catch { return p.replace(/%20/g, " "); } }`;
  if (!fs.existsSync(target)) {
    console.warn('[sb-patch] addon-vitest não encontrado — patch #36045 pulado.');
    return;
  }
  const code = fs.readFileSync(target, 'utf8');
  if (code.includes('decodeURIComponent(p)')) return;
  if (!code.includes(OLD)) {
    console.warn('[sb-patch] assinatura #36045 não encontrada — versão do addon mudou.');
    return;
  }
  fs.writeFileSync(target, code.replace(OLD, NEW));
  console.log('[sb-patch] #36045 aplicado (convertToFilePath decode).');
}

function patchJestRegister() {
  const OLD = 'register(typescriptLoaderUrl, import.meta.url), isTypescriptLoaderRegistered = !0;';
  const NEW = 'try { register(typescriptLoaderUrl, import.meta.url); } catch {} isTypescriptLoaderRegistered = !0;';
  if (!fs.existsSync(chunksDir)) {
    console.warn('[sb-patch] chunks do storybook não encontrados — patch #36116 pulado.');
    return;
  }
  let changed = false;
  for (const name of fs.readdirSync(chunksDir)) {
    if (!name.endsWith('.js')) continue;
    const file = path.join(chunksDir, name);
    const code = fs.readFileSync(file, 'utf8');
    if (!code.includes(OLD)) continue;
    fs.writeFileSync(file, code.replace(OLD, NEW));
    changed = true;
    console.log(`[sb-patch] #36116 aplicado em ${name} (register com try/catch).`);
  }
  if (!changed) console.log('[sb-patch] #36116 já aplicado ou assinatura não encontrada.');
}

function clearStorybookCache() {
  const cacheDir = path.join(root, 'node_modules', '.cache', 'storybook');
  if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
}

patchAddonVitest();
patchJestRegister();
clearStorybookCache();
