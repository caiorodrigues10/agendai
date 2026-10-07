/// <reference types="vitest/globals" />
import fs from 'node:fs';
import path from 'node:path';

/**
 * R11 da auditoria: larguras fixas.
 *
 * - `ResetPasswordPage`/`PublicOwnerInvitePage`/`ForgotPasswordPage` usam
 *   `w-full max-w-[420px]` (nunca `w-[420px]` fixo) — cartão que se adapta
 *   em 320px sem estouro (sondagem: scrollWidth = clientWidth).
 * - Os círculos `w-[560px]`/`w-[520px]` do `LoginPage` são decorativos e
 *   ficam dentro do `BrandPanel` (`hidden lg:flex ... overflow-hidden`):
 *   fora do mobile e recortados no desktop.
 * - Tabelas `min-w-[680px..980px]` dos painéis ficam sempre dentro de um
 *   contêiner `overflow-x-auto` sem `no-scrollbar` (a indicação de rolagem
 *   vem do thumb global `::-webkit-scrollbar` de src/styles/base.css).
 */
const SRC = path.resolve(process.cwd(), 'src');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

const CARTOES = [
  'pages/ResetPasswordPage.tsx',
  'pages/PublicOwnerInvitePage.tsx',
  'pages/ForgotPasswordPage.tsx',
];

const PAINEL_TABELAS = [
  'features/crm/CrmIntelligencePanel.tsx',
  'features/finance/components/OwnerFinancialPanel.tsx',
  'features/finance/components/FinancialDashboard.tsx',
];

describe('R11 — larguras fixas das páginas públicas', () => {
  it.each(CARTOES)('%s usa só max-w-[420px] (nunca w-[420px] fixo)', (file) => {
    const semMax = read(file).replace(/max-w-\[420px\]/g, '');
    expect(semMax).not.toContain('w-[420px]');
    expect(read(file)).toContain('w-full max-w-[420px]');
  });

  it('os círculos w-[560px]/w-[520px] do login continuam ocultos em mobile e recortados', () => {
    const src = read('pages/LoginPage.tsx');
    expect(src).toMatch(/className="[^"]*hidden lg:flex[^"]*overflow-hidden[^"]*"/);
    expect(src).toContain('w-[560px]');
    expect(src).toContain('w-[520px]');
    for (const match of src.matchAll(/className="[^"]*(?:w-\[560px\]|w-\[520px\])[^"]*"/g)) {
      expect(match[0]).toContain('pointer-events-none');
      expect(match[0]).toContain('blur-');
    }
  });
});

describe('R11 — tabelas largas dos painéis', () => {
  it.each(PAINEL_TABELAS)('%s: toda tabela min-w-[Npx] fica em contêiner overflow-x-auto sem no-scrollbar', (file) => {
    const src = read(file);
    const tabelas = [...src.matchAll(/<table className="[^"]*min-w-\[\d+px\][^"]*"/g)];
    expect(tabelas.length).toBeGreaterThan(0);
    for (const tabela of tabelas) {
      const inicio = tabela.index ?? 0;
      const janela = src.slice(Math.max(0, inicio - 400), inicio);
      const abertura = janela.slice(janela.lastIndexOf('<div'));
      expect(abertura, `${file} → ${tabela[0]}`).toContain('overflow-x-auto');
      expect(abertura, `${file} → ${tabela[0]}`).not.toContain('no-scrollbar');
    }
  });

  it('existe thumb global de scrollbar (indicação visual de rolagem)', () => {
    const css = read('styles/base.css');
    expect(css).toMatch(/::-webkit-scrollbar\s*\{\s*width:\s*\d+px/);
    expect(css).toContain('.no-scrollbar');
  });
});
