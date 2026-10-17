#!/usr/bin/env node
/**
 * Espelha a spec de imagem e os helpers do tema da página pública do backend.
 *
 * Fonte única = backend. Copia os arquivos auto-contidos (sem imports do
 * backend) para `src/shared/` com cabeçalho "GERADO" e formatação prettier
 * deste repositório. Não editar os espelhos à mão — rode `npm run theme:mirror`.
 *
 * Uso:
 *   node scripts/generate-shop-theme-mirror.mjs          (grava os espelhos)
 *   node scripts/generate-shop-theme-mirror.mjs --check  (exit 1 se desatualizado)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(process.env.API_CONTRACT_BACKEND || path.join(root, '../backend'));

const HEADER = [
  '/**',
  ' * GERADO a partir do backend (fonte única) — não edite manualmente.',
  ' * Depois de mexer nos arquivos de origem, rode `npm run theme:mirror`',
  ' * e valide com `npm run theme:check`.',
  ' */',
  '',
].join('\n');

/** [arquivo de origem no backend, espelho no frontend] */
const FILES = [
  ['src/shared/constants/imageSpecs.ts', 'src/shared/imageSpecs.ts'],
  ['src/modules/barbershops/utils/pageThemeDefaults.ts', 'src/shared/pageThemeDefaults.ts'],
  ['src/modules/barbershops/utils/pageThemeContrast.ts', 'src/shared/pageThemeContrast.ts'],
];

const checkOnly = process.argv.includes('--check');

async function generate() {
  const results = [];
  for (const [sourceRel, targetRel] of FILES) {
    const sourcePath = path.join(backend, sourceRel);
    if (!fs.existsSync(sourcePath)) {
      console.error(`Arquivo de origem não encontrado: ${sourcePath}`);
      console.error('Defina API_CONTRACT_BACKEND se o backend estiver em outro caminho.');
      process.exit(1);
    }
    const targetPath = path.join(root, targetRel);
    const raw = fs.readFileSync(sourcePath, 'utf8');
    const config = (await prettier.resolveConfig(targetPath)) ?? {};
    const content = await prettier.format(HEADER + raw, { ...config, filepath: targetPath });
    results.push({ targetRel, targetPath, content });
  }
  return results;
}

const results = await generate();

if (checkOnly) {
  const stale = results.filter(
    (r) => !fs.existsSync(r.targetPath) || fs.readFileSync(r.targetPath, 'utf8') !== r.content,
  );
  if (stale.length > 0) {
    console.error('theme:check FAILED — espelho desatualizado (rode `npm run theme:mirror`):');
    for (const r of stale) console.error(` - ${r.targetRel}`);
    process.exit(1);
  }
  console.log('theme:check OK (espelho igual ao backend).');
} else {
  for (const r of results) fs.writeFileSync(r.targetPath, r.content, 'utf8');
  console.log(`theme:mirror: ${results.length} arquivos espelhados em src/shared/.`);
}
