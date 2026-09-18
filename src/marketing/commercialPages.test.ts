/// <reference types="vitest/globals" />
import { COMMERCIAL_PAGES } from './commercialPages';
import { canonicalUrl } from './siteUrl';

describe('commercial pages', () => {
  it('keeps unique intent URLs and distinct H1s', () => {
    expect(COMMERCIAL_PAGES).toHaveLength(9);
    const paths = COMMERCIAL_PAGES.map(page => page.path);
    const h1s = COMMERCIAL_PAGES.map(page => page.h1);
    expect(new Set(paths).size).toBe(COMMERCIAL_PAGES.length);
    expect(new Set(h1s).size).toBe(COMMERCIAL_PAGES.length);
    expect(paths.slice(0, 4)).toEqual([
      '/software-para-salao-de-beleza',
      '/sistema-para-barbearia',
      '/app-para-agendamento-de-salao',
      '/sistema-para-fila-de-barbearia',
    ]);
  });

  it('builds canonical URLs from the public site origin', () => {
    expect(canonicalUrl('/planos')).toMatch(/\/planos$/);
  });
});
