/// <reference types="vitest/globals" />
import fs from 'node:fs';
import path from 'node:path';
import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * ITEM B — fila pública, agenda e produto.
 *
 * Problemas medidos (medição `b-antes`): a onda crítica da rota
 * `/queue/:id` puxava o closure estático do PublicHome (22 chunks / 1,13 MB),
 * incluindo `ui/chart` (77,9 kB) vindo da barrel de clients → ClientsTab →
 * CrmIntelligencePanel; os fetches de barbearia/agenda só partiam no mount do
 * PublicHome (~2,9 s); em modo real não havia <h1> na fila nem na aba
 * Agenda; CTAs de erro ficavam com 36–40 px de altura (< 44 px).
 *
 * Estes contratos falham antes da otimização e passam depois.
 */
const SRC = path.resolve(process.cwd(), 'src');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

describe('Item B — contratos de código', () => {
  it('PublicHome importa AddCustomerForm direto (sem barrel de clients → ui/chart)', () => {
    const src = read('pages/PublicHome.tsx');
    expect(src).toContain("from '../features/clients/AddCustomerForm'");
    expect(src).not.toMatch(/from '\.\.\/features\/clients'/);
  });

  it('PublicHome só monta ShopProfile via React.lazy (fora do closure da rota)', () => {
    const src = read('pages/PublicHome.tsx');
    expect(src).not.toMatch(/from '\.\.\/features\/shop'/);
    expect(src).toContain("import('../features/shop/ShopProfile')");
    expect(src).toContain('<Suspense fallback={<PublicPageSkeleton />}>');
  });

  it('rota /queue/:id passa pelo PublicShopRoute (tenant antes do chunk montar)', () => {
    const appSrc = read('app/App.tsx');
    expect(appSrc).toContain('<Route path="/queue/:id" element={<PublicShopRoute />} />');
    expect(appSrc).not.toContain('<Route path="/queue/:id" element={<PublicHome />} />');
  });

  it('fila em modo real tem <h1> (nome do salão no QueueStatusCard)', () => {
    const src = read('features/queue/QueueStatusCard.tsx');
    expect(src).toContain('<h1 className="text-xl font-bold text-text-primary tracking-tight truncate">');
    expect(src).not.toContain('<h2 className="text-xl');
  });

  it('aba Agenda tem <h1> no estado inicial e na confirmação', () => {
    const src = read('features/appointments/AppointmentScheduler.tsx');
    expect(src).toContain('<h1 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">');
    expect(src).toContain('<h1 className="text-2xl font-bold text-text-primary mb-2">');
    expect(src).not.toContain('<h2 className="text-2xl font-bold text-text-primary mb-2">');
  });

  it('PublicHome importa AppointmentScheduler direto (sem barrel de appointments)', () => {
    const src = read('pages/PublicHome.tsx');
    expect(src).toContain("from '../features/appointments/AppointmentScheduler'");
    expect(src).not.toMatch(/from '\.\.\/features\/appointments'/);
  });

  it('CTAs de erro da fila e do produto cumprem a alavanca mínima de 44 px', () => {
    const home = read('pages/PublicHome.tsx');
    expect(home).toContain('min-h-11 inline-flex items-center px-4 py-2 rounded-xl bg-accent');
    const product = read('pages/PublicProductPage.tsx');
    expect(product).toContain('px-4 py-2.5 min-h-11 inline-flex items-center');
  });

  it('produto: cada estado de página monta um nó raiz próprio (sem layout-shift)', () => {
    const product = read('pages/PublicProductPage.tsx');
    // Sem key, o React reutilizava o div raiz entre loading (full-width) e
    // erro (max-w-md) — layout-shift de 0,34 em 1440 px com a API fora.
    for (const key of ['key="loading"', 'key="error"', 'key="reservation"', 'key="content"']) {
      expect(product).toContain(key);
    }
  });
});

const probeState = vi.hoisted(() => ({
  firstId: null as string | null,
  captured: false,
}));

vi.mock('../pages/PublicHome', async () => {
  // Imita a latência do download do chunk: o efeito do wrapper precisa aplicar
  // o id da URL antes do PublicHome montar (na rede real o chunk leva séculos
  // a mais que o efeito; sem atraso o mock resolveria antes do commit).
  await new Promise(resolve => setTimeout(resolve, 50));
  const { useBarbershopFilters } = await import('../contexts/BarbershopFiltersContext');
  const Probe = () => {
    const { barbershopId } = useBarbershopFilters();
    if (!probeState.captured) {
      probeState.firstId = barbershopId;
      probeState.captured = true;
    }
    return <div data-testid="public-home-probe" />;
  };
  return { default: Probe };
});

describe('PublicShopRoute (comportamento)', () => {
  it('aplica o id da URL antes do primeiro render do PublicHome', async () => {
    probeState.firstId = null;
    probeState.captured = false;

    const { BarbershopFiltersProvider } = await import('../contexts/BarbershopFiltersContext');
    const { PublicShopRoute } = await import('../app/PublicShopRoute');

    render(
      <BarbershopFiltersProvider>
        <MemoryRouter initialEntries={['/queue/shop-1']}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/queue/:id" element={<PublicShopRoute />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      </BarbershopFiltersProvider>,
    );

    await screen.findByTestId('public-home-probe');
    expect(probeState.firstId).toBe('shop-1');
  });
});
