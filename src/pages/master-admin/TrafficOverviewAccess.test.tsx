/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrafficOverviewAccess } from './TrafficOverviewPage';
import { adminTrafficApi } from '../../infra/adminTrafficApi';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../infra/adminTrafficApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/adminTrafficApi')>();
  return {
    ...actual,
    adminTrafficApi: {
      getTrafficReport: vi.fn(),
      exportTrafficCsv: vi.fn(),
    },
  };
});

const renderAccess = (children: React.ReactNode = <div data-testid="painel" />) =>
  render(
    <MemoryRouter>
      <TrafficOverviewAccess>{children}</TrafficOverviewAccess>
    </MemoryRouter>
  );

describe('TrafficOverviewAccess', () => {
  beforeEach(() => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: {} as never,
    });
    vi.mocked(adminTrafficApi.exportTrafficCsv).mockResolvedValue({
      ok: true,
      blob: async () => new Blob([]),
    } as Response);
  });

  it('OWNER vê acesso negado e nenhuma chamada ao relatório de tráfego', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'owner-1',
        name: 'Dona',
        email: 'dono@salao.local',
        role: 'OWNER',
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderAccess();

    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.queryByTestId('painel')).not.toBeInTheDocument();
    expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
    expect(adminTrafficApi.exportTrafficCsv).not.toHaveBeenCalled();
  });

  it('MASTER_ADMIN sem internal:traffic:read também não monta o painel', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'master-1',
        name: 'Master',
        email: 'master@agendai.local',
        role: 'MASTER_ADMIN',
        internalPermissions: ['internal:dashboard:read'],
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderAccess();

    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
  });

  it('MASTER_ADMIN com a permissão monta o painel', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'master-2',
        name: 'Master',
        email: 'master@agendai.local',
        role: 'MASTER_ADMIN',
        internalPermissions: ['internal:traffic:read'],
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderAccess();

    expect(await screen.findByTestId('painel')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Acesso negado' })).not.toBeInTheDocument();
  });

  it('enquanto a sessão carrega não monta nada (nem consulta a API)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
    } as ReturnType<typeof useAuth>);

    renderAccess();

    expect(screen.queryByTestId('painel')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Acesso negado' })).not.toBeInTheDocument();
    expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
  });
});
