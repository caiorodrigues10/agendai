import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { renderTextWarning, renderTextWarningMessage } from './renderTextGlyphs';

interface GlyphFixture {
  cases: {
    id: string;
    max: number;
    input: string | null;
    expect: { text: string; removed: boolean; dropped: string[]; truncated: boolean };
  }[];
}

describe('renderTextWarning', () => {
  it('aponta emojis removidos no render ("💈 Corte ✂️")', () => {
    const r = renderTextWarning('💈 Corte ✂️', 40);
    expect(r.dropped).toEqual(['💈', '✂️']);
    expect(r.truncated).toBe(false);
    expect(renderTextWarningMessage(r, 'Título', 40)).toContain('💈 ✂️');
  });

  it('aponta caracteres CJK removidos ("纹身")', () => {
    const r = renderTextWarning('纹身', 40);
    expect(r.dropped).toEqual(['纹', '身']);
    expect(r.truncated).toBe(false); // sobra texto vazio, que não estoura o limite
    expect(renderTextWarningMessage(r, 'Título', 40)).toContain('纹 身');
  });

  it('não avisa quando todo o texto tem glifo', () => {
    const r = renderTextWarning('Corte & Barba R$ 45,00 — Promoção nº 1 (50%) @spa €5', 60);
    expect(r).toEqual({ dropped: [], truncated: false });
    expect(renderTextWarningMessage(r, 'Título', 60)).toBe('');
  });

  it('avisa corte no limite do modelo (40) mesmo sem caracteres perdidos', () => {
    const r = renderTextWarning('TABELA DE VALORES COMPLETA DOS NOSSOS SERVIÇOS PREMIUM', 40);
    expect(r.dropped).toEqual([]);
    expect(r.truncated).toBe(true);
    expect(renderTextWarningMessage(r, 'Título', 40)).toContain('40 caracteres');
  });

  it('lista caracteres perdidos sem repetir e sem contar espaço', () => {
    const r = renderTextWarning('💈💈x 🪒  y   z', 40);
    expect(r.dropped).toEqual(['💈', '🪒']);
  });

  it('aceita null/undefined/vazio', () => {
    expect(renderTextWarning(null, 40)).toEqual({ dropped: [], truncated: false });
    expect(renderTextWarning(undefined, 40)).toEqual({ dropped: [], truncated: false });
    expect(renderTextWarning('', 40)).toEqual({ dropped: [], truncated: false });
  });
});

/**
 * Contrato único com o backend (`sanitize.ts`): mesma fixture JSON, testada
 * dos dois lados — aqui se asserta dropped/truncated, lá text/removed.
 */
describe('glyphFixtures.json (contrato compartilhado com o backend)', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const backend = path.resolve(process.env.API_CONTRACT_BACKEND || path.join(root, '../backend'));
  const fixturePath = path.join(backend, 'src/modules/posts/templates/_engine/glyphFixtures.json');

  it('consegue ler a fixture do backend irmão', () => {
    expect(
      fs.existsSync(fixturePath),
      `Backend não encontrado em "${backend}" (esperado ${fixturePath}). ` +
        'Defina API_CONTRACT_BACKEND com o caminho da pasta do backend.',
    ).toBe(true);
  });

  const fixture: GlyphFixture = fs.existsSync(fixturePath)
    ? JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
    : { cases: [] };

  for (const c of fixture.cases) {
    it(`${c.id}: renderTextWarning bate com a fixture`, () => {
      expect(renderTextWarning(c.input, c.max)).toEqual({
        dropped: c.expect.dropped,
        truncated: c.expect.truncated,
      });
    });
  }
});
