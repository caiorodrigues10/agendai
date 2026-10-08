/// <reference types="vitest/globals" />
import fs from 'node:fs';
import path from 'node:path';

/**
 * ITEM C — restauração das animações de `/` e `/planos` removidas no L2.
 *
 * O L2 tirou o tween das linhas do H1 (`autoAlpha + yPercent 115`, que
 * escondia o texto até a animação terminar) e o `motion.*` do hero de
 * `/planos` (opacity inicial 0) para tornar o LCP determinístico. O Item C
 * devolve o movimento como @keyframes puro, só com transform:
 *
 * - conteúdo visível na 1ª pintura (nenhuma regra com opacity);
 * - transform não gera CLS nem reordena o LCP;
 * - sem dependência de JS (roda junto com o primeiro paint);
 * - desligado em prefers-reduced-motion.
 *
 * Escopo final: a animação do `/planos` ficou (custo ~0); a do `/` foi
 * implementada e REVERTIDA por piora de LCP em off@1440 — 6 sessões de A/B
 * na mesma build, com animação 2184/2288/2360 ms vs sem 2032/2032/2104 ms
 * (~+220 ms), demais células neutras. Estes contratos falham antes da
 * restauração (hero.css/ausente, classes sem animação) e passam depois.
 */
const SRC = path.resolve(process.cwd(), 'src');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

const heroCss = () => read('styles/features/hero.css');

describe('Item C — animações restauradas sem esconder conteúdo', () => {
  it('hero.css é importado pelo index.css (caminho crítico)', () => {
    expect(read('index.css')).toContain("@import './styles/features/hero.css';");
  });

  it("`/` fica sem animação de CSS no H1 (revertida por piora de LCP)", () => {
    const css = heroCss();
    // A regra da rodada: se piorar LCP, mantém sem animação — com números.
    expect(css).not.toContain('@keyframes hero-line-rise');
    expect(css).not.toMatch(/\[data-hero-line\]\s*\{/);
    // Nenhuma regra (declarada) do arquivo pode esconder conteúdo via opacity.
    expect(css).not.toMatch(/opacity\s*:/);
    // E o LandingPage não re-insere o tween do H1 no gsap.
    const src = read('pages/LandingPage.tsx');
    expect(src).not.toMatch(/'\[data-hero-line\]'/);
  });

  it('hero de `/planos` usa as classes de rise com stagger', () => {
    const css = heroCss();
    expect(css).toContain('@keyframes planos-hero-rise');
    expect(css).toContain('.planos-hero-rise');
    expect(css).toContain('animation-delay: 0.08s');
    expect(css).toContain('animation-delay: 0.16s');

    const src = read('pages/PlansPage.tsx');
    // Título, subtítulo e alternador mensal/anual.
    const usos = src.match(/planos-hero-rise/g) || [];
    expect(usos.length).toBeGreaterThanOrEqual(6);
    // O hero continua sem motion.* (o framer segue para seções abaixo da dobra).
    expect(src).not.toContain('<motion.h1');
    expect(src).not.toContain('<motion.p');
  });

  it('animações ficam fora em prefers-reduced-motion', () => {
    const css = heroCss();
    const bloco = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(bloco).toContain('.planos-hero-rise');
    expect(bloco).toContain('animation: none');
  });
});
