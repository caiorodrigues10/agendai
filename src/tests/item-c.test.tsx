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
 * Escopo final: a animação do `/planos` ficou (custo ~0); a do `/`
 * (hero-line-rise) foi implementada no Item C, revertida por piora de LCP
 * (+220 ms em 6 sessões) e REAVALIADA no Item 3 desta rodada: novo A/B
 * intercalado de 6 sessões na build atual mostrou delta +20 ms em off@1440
 * (2008/1988/2012 sem vs 2028/2028/2020 com; off@375 neutro) — dentro do
 * critério (≤ +100 ms), então a animação foi MANTIDA. Estes contratos falham
 * antes da restauração (hero.css sem keyframes, classes sem animação) e
 * passam depois.
 */
const SRC = path.resolve(process.cwd(), 'src');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

const heroCss = () => read('styles/features/hero.css');

describe('Item C — animações restauradas sem esconder conteúdo', () => {
  it('hero.css é importado pelo index.css (caminho crítico)', () => {
    expect(read('index.css')).toContain("@import './styles/features/hero.css';");
  });

  it('`/` anima as linhas do H1 com hero-line-rise (mantida no Item 3)', () => {
    const css = heroCss();
    expect(css).toContain('@keyframes hero-line-rise');
    expect(css).toContain('.hero-line-rise');
    expect(css).toContain('animation-delay: 0.08s');
    expect(css).toContain('animation-delay: 0.16s');
    // Nenhuma regra (declarada) do arquivo pode esconder conteúdo via opacity.
    expect(css).not.toMatch(/opacity\s*:/);
    // E o LandingPage continua sem re-insere o tween do H1 no gsap.
    const src = read('pages/LandingPage.tsx');
    expect(src).not.toMatch(/'\[data-hero-line\]'/);
    const usos = src.match(/hero-line-rise/g) || [];
    expect(usos.length).toBeGreaterThanOrEqual(3);
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
    expect(bloco).toContain('.hero-line-rise');
    expect(bloco).toContain('animation: none');
  });
});
