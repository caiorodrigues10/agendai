/// <reference types="vitest/globals" />
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

/**
 * L2 da auditoria de LCP (medição `scripts/measure-responsive.mjs --lcp`):
 *
 * - `/` e `/planos` nasciam com o texto do hero escondido (`autoAlpha: 0` /
 *   `initial opacity 0`) e o LCP só chegava no fim da animação (~3,1 s);
 *   `/planos` também executava o bundle do recharts antes do primeiro render.
 * - `/queue` sem `:id` redirecionava para a landing só DEPOIS de baixar o
 *   chunk pesado do PublicHome (~1,1 MB), atrasando o LCP em ~1,5 s.
 *
 * Estes contratos falham antes da otimização e passam depois.
 */
const SRC = path.resolve(process.cwd(), 'src');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

describe('L2 — LCP das rotas públicas (contrato de código)', () => {
  it('LandingPage carrega o GSAP por import dinâmico (fora do caminho do LCP)', () => {
    const src = read('pages/LandingPage.tsx');
    expect(src).not.toMatch(/from ['"]gsap(\/ScrollTrigger)?['"]/);
    expect(src).toContain("import('gsap')");
    expect(src).toContain("import('gsap/ScrollTrigger')");
  });

  it('LandingPage não esconde o texto do hero antes da animação', () => {
    const src = read('pages/LandingPage.tsx');
    // A linha do H1 não pode mais ser animada por dentro do `overflow-hidden`
    // (isso a tornava invisível na primeira pintura, empurrando o LCP).
    expect(src).not.toMatch(/'\[data-hero-line\]'/);
    for (const target of ['badge', 'copy', 'action']) {
      const start = src.indexOf(`'[data-hero-${target}]'`);
      expect(start, `seletor data-hero-${target} no timeline`).toBeGreaterThan(-1);
      const bloco = src.slice(start, src.indexOf('-=', start));
      expect(bloco, `hero-${target} sem autoAlpha ocultando`).not.toContain('autoAlpha');
    }
  });

  it('PlansPage carrega os gráficos de persuasão por lazy import', () => {
    const src = read('pages/PlansPage.tsx');
    expect(src).toContain("import('../features/marketing/PricingPersuasionCharts')");
    expect(src).not.toMatch(/from ['"]\.\.\/features\/marketing['"]/);
    expect(src).toContain('<React.Suspense');
  });

  it('PlansPage não anima o hero com opacity inicial 0', () => {
    const src = read('pages/PlansPage.tsx');
    expect(src).not.toContain('<motion.h1');
    expect(src).not.toContain('<motion.p');
    // O bloco do alternador mensal/anual também ficou estático (y:8 era exclusivo dele).
    expect(src).not.toContain('initial={{ opacity: 0, y: 8 }}');
  });

  it('/queue (sem :id) decide o redirecionamento antes do chunk do PublicHome', () => {
    const appSrc = read('app/App.tsx');
    expect(appSrc).toContain('<Route path="/queue" element={<QueueIndexRoute />} />');
    // /queue/:id passa pelo wrapper eager: seta o tenant da URL antes do chunk
    // do PublicHome montar (Item B — API parte junto com o early request map).
    expect(appSrc).toContain('<Route path="/queue/:id" element={<PublicShopRoute />} />');

    const src = read('app/QueueIndexRoute.tsx');
    expect(src).toContain('Navigate to="/"');
    expect(src).toContain("lazy(() => import('../pages/PublicHome'))");
    expect(src).toContain('isShopStaffRole');
  });
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../contexts/BarbershopFiltersContext', () => ({
  useBarbershopFilters: vi.fn(),
}));

vi.mock('../contexts/BarbershopContext', () => ({
  isShopStaffRole: (role?: string) => {
    const normalized = (role || '').toUpperCase();
    return normalized === 'OWNER' || normalized === 'EMPLOYEE';
  },
}));

vi.mock('../pages/PublicHome', () => ({
  default: () => <div data-testid="public-home" />,
}));

const { useAuth } = await import('../contexts/AuthContext');
const { useBarbershopFilters } = await import('../contexts/BarbershopFiltersContext');
const { QueueIndexRoute } = await import('../app/QueueIndexRoute');

function renderQueue(route = '/queue') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <React.Suspense fallback={<div data-testid="suspense" />}>
        <Routes>
          <Route path="/queue" element={<QueueIndexRoute />} />
          <Route path="/" element={<div data-testid="landing" />} />
        </Routes>
      </React.Suspense>
    </MemoryRouter>
  );
}

describe('QueueIndexRoute (comportamento)', () => {
  it('sem sessão redireciona para a landing sem montar o PublicHome', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    } as never);
    vi.mocked(useBarbershopFilters).mockReturnValue({
      barbershopId: null,
    } as never);

    renderQueue();

    expect(screen.getByTestId('landing')).toBeInTheDocument();
    expect(screen.queryByTestId('public-home')).not.toBeInTheDocument();
  });

  it('segurando o esqueleto enquanto a sessão carrega', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
    } as never);
    vi.mocked(useBarbershopFilters).mockReturnValue({
      barbershopId: null,
    } as never);

    renderQueue();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('landing')).not.toBeInTheDocument();
  });

  it('staff com salão próprio abre a fila do salão', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'OWNER', barbershopId: 'shop-1' },
      loading: false,
    } as never);
    vi.mocked(useBarbershopFilters).mockReturnValue({
      barbershopId: null,
    } as never);

    renderQueue();

    expect(await screen.findByTestId('public-home')).toBeInTheDocument();
    expect(screen.queryByTestId('landing')).not.toBeInTheDocument();
  });
});
