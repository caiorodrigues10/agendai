/// <reference types="vitest/globals" />
import fs from 'node:fs';
import path from 'node:path';

/**
 * R12 da auditoria: `prefers-reduced-motion` deve valer para o GSAP e o
 * framer-motion das páginas públicas.
 *
 * - framer-motion: `<MotionConfig reducedMotion="user">` no App desliga
 *   transformações/layout das animações `motion.*` quando o sistema pedir
 *   movimento reduzido (opacidade/cor continua).
 * - GSAP: páginas com animações declaradas precisam checar a preferência
 *   (LandingPage já usava `gsap.matchMedia`; FeaturesPage/AiPredictivePage
 *   passam a usar `prefersReducedMotion()`), forçando os alvos `opacity-0`
 *   à visibilidade para o conteúdo não ficar escondido sem animação.
 * - O scroll CTA fixo da landing continua aparecendo (é navegação), mas
 *   sem deslocamento vertical nem tween de duração sob movimento reduzido.
 */
const SRC = path.resolve(process.cwd(), 'src');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

const PAGINAS_COM_GSAP = ['pages/LandingPage.tsx', 'pages/marketing/FeaturesPage.tsx', 'pages/marketing/AiPredictivePage.tsx'];

describe('R12 — prefers-reduced-motion', () => {
  it('App envolve tudo em MotionConfig com reducedMotion="user"', () => {
    const src = read('app/App.tsx');
    expect(src).toContain('import { MotionConfig } from');
    expect(src).toContain('<MotionConfig reducedMotion="user">');
    expect(src).toContain('</MotionConfig>');
  });

  it.each(PAGINAS_COM_GSAP)('%s checa a preferência antes de animar com GSAP', (file) => {
    const src = read(file);
    expect(src.includes('prefers-reduced-motion') || src.includes('prefersReducedMotion')).toBe(true);
  });

  it('helper de movimento reduzido continua consultando a mídia certa', () => {
    const src = read('utils/reducedMotion.ts');
    expect(src).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
  });

  it('páginas com GSAP revelam os alvos opacity-0 sem animação', () => {
    for (const file of ['pages/marketing/FeaturesPage.tsx', 'pages/marketing/AiPredictivePage.tsx']) {
      const src = read(file);
      expect(src, file).toContain("gsap.set('.opacity-0', { opacity: 1 })");
    }
  });

  it('CSS global mantém a regra de movimento reduzido', () => {
    const css = read('styles/base.css');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
