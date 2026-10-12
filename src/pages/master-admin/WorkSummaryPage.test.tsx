/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkSummaryPage } from './WorkSummaryPage';
import { adminInternalApi, type WorkSummary } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: {
    getWorkSummary: vi.fn(),
  },
}));

const getWorkSummary = vi.mocked(adminInternalApi.getWorkSummary);

const EMPTY_SUMMARY: WorkSummary = {
  summary: {
    totalOpenTickets: 0,
    totalInProgressTickets: 0,
    totalMyActiveTasks: 0,
    totalCompletedToday: 0,
    unassignedCount: 0,
  },
  myOpenTickets: [],
  myOverdueTasks: [],
  myTodayTasks: [],
  unassignedTickets: [],
  recentActivity: [],
};

describe('WorkSummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getWorkSummary.mockResolvedValue(EMPTY_SUMMARY);
  });

  it('dá nome acessível ao botão só-ícone de atualizar o resumo', async () => {
    render(
      <MemoryRouter>
        <WorkSummaryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Meu trabalho' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });
});
