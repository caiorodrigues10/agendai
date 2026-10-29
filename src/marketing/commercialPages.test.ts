/// <reference types="vitest/globals" />
import { COMMERCIAL_PAGES } from './commercialPages';
import { canonicalUrl } from './siteUrl';

describe('commercial pages', () => {
  it('keeps unique intent URLs and distinct H1s', () => {
    expect(COMMERCIAL_PAGES).toHaveLength(10);
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

  it('tem página de advocacia sem promessa de resultado jurídico', () => {
    const page = COMMERCIAL_PAGES.find(p => p.path === '/software-para-escritorio-de-advocacia');
    expect(page).toBeDefined();
    const text = JSON.stringify(page).toLowerCase();
    expect(text).toContain('honorários');
    expect(text).toContain('não substitui a análise jurídica');
    expect(text).not.toContain('ganho de causa');
    expect(text).not.toContain('resultado da causa');
  });

  it('builds canonical URLs from the public site origin', () => {
    expect(canonicalUrl('/planos')).toMatch(/\/planos$/);
  });
});
