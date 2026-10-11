/// <reference types="vitest/globals" />
import fs from 'node:fs';
import path from 'node:path';

/**
 * R4 da auditoria: nada de altura presa a 100vh.
 *
 * Em mobile o `100vh` é o viewport "grande" (barra de endereço recolhida), então
 * containers com altura mínima/chaveada nele ficam maiores do que a área visível e
 * escondem rodapé/conteúdo atrás da UI do navegador. Usa-se `dvh` (adaptável) — o que
 * já valia para o body (src/styles/base.css) e para menus/modais.
 *
 * Não entra aqui a altura fracionária de modal (`max-h-[90vh]`): é limite interno de
 * componente, não a altura da página.
 */
const SRC = path.resolve(process.cwd(), 'src');
const SELF = path.join('tests', 'viewport-units.test.ts');
const FORBIDDEN = /(^|[^-\w])(?:h|min-h|max-h)-screen\b|\b100vh\b/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('R4 — alturas de viewport usam dvh, nunca 100vh', () => {
  it('nenhuma classe h-screen/min-h-screen nem 100vh sobrevive em src', () => {
    const hits: string[] = [];
    for (const file of walk(SRC)) {
      const rel = path.relative(SRC, file);
      if (rel === SELF) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(FORBIDDEN)) {
        const line = text.slice(0, match.index ?? 0).split('\n').length;
        hits.push(`${rel}:${line}: ${match[0].trim()}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
