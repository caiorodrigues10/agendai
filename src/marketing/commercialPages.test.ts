import { describe, expect, it } from 'vitest';
import { COMMERCIAL_PAGES } from './commercialPages';
import { canonicalUrl } from './siteUrl';

describe('commercial pages', () => {
  it('keeps four unique intent URLs and distinct H1s', () => {
    expect(COMMERCIAL_PAGES).toHaveLength(4);
    const paths = COMMERCIAL_PAGES.map(page => page.path);
    const h1s = COMMERCIAL_PAGES.map(page => page.h1);
    expect(new Set(paths).size).toBe(4);
    expect(new Set(h1s).size).toBe(4);
    expect(paths).toEqual([
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
