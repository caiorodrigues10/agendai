/// <reference types="vitest/globals" />
import { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SchedulingProvider, useScheduling } from './SchedulingContext';
import { schedulingApi } from '@/infra/schedulingApi';
import { authStorage } from '@/infra/authStorage';

vi.mock('@/infra/schedulingApi', () => ({
  schedulingApi: {
    listQueue: vi.fn(),
    listAppointments: vi.fn(),
    getAvailability: vi.fn(),
    getQueueMetrics: vi.fn(),
    joinQueue: vi.fn(),
    updateQueueItem: vi.fn(),
    deleteQueueItem: vi.fn(),
    bookAppointment: vi.fn(),
    bookAppointmentPublic: vi.fn(),
    updateAppointment: vi.fn(),
    deleteAppointment: vi.fn(),
    checkInAppointment: vi.fn(),
  },
}));
vi.mock('./BarbershopFiltersContext', () => ({
  useBarbershopFilters: () => ({ barbershopId: 'shop-1' }),
}));
vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-owner' } }),
}));
vi.mock('./BarbershopContext', () => ({
  useBarbershop: () => ({ services: [], settings: {} }),
}));
vi.mock('@/services/geminiService', () => ({
  getQueueInsight: vi.fn(async () => null),
}));

const api = vi.mocked(schedulingApi);

type Ctx = ReturnType<typeof useScheduling>;
let ctx: Ctx;

function Capture() {
  const value = useScheduling();
  useEffect(() => {
    ctx = value;
  });
  return null;
}

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={['/app']}>
      <SchedulingProvider>
        <Capture />
      </SchedulingProvider>
    </MemoryRouter>
  );
}

const rawAppt = (id: string) => ({
  id,
  barbershopId: 'shop-1',
  customerName: `Cliente ${id}`,
  whatsapp: '11999999999',
  serviceId: 's1',
  staffId: 'st1',
  date: '2026-01-01',
  time: '10:00',
});

const page = (items: unknown[], meta: { total: number; page: number; limit: number; totalPages: number }) => ({
  items,
  meta,
});

async function renderSettled() {
  renderProvider();
  await waitFor(() => expect(ctx.loading).toBe(false));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  authStorage.setTokens('token-1', undefined, false);
  api.listQueue.mockResolvedValue([]);
  api.getQueueMetrics.mockResolvedValue({ completedCount: 0 });
  api.getAvailability.mockResolvedValue([]);
  api.listAppointments.mockResolvedValue(
    page([], { total: 0, page: 1, limit: 100, totalPages: 1 })
  );
});

describe('SchedulingContext.refreshAppointments', () => {
  it('itera 2 páginas quando meta.totalPages = 2', async () => {
    await renderSettled();
    api.listAppointments.mockReset();
    api.listAppointments
      .mockResolvedValueOnce(page([rawAppt('a1')], { total: 2, page: 1, limit: 100, totalPages: 2 }))
      .mockResolvedValueOnce(page([rawAppt('a2')], { total: 2, page: 2, limit: 100, totalPages: 2 }));

    await act(async () => {
      await ctx.refreshAppointments('2026-01-01');
    });

    expect(api.listAppointments).toHaveBeenCalledTimes(2);
    expect(vi.mocked(api.listAppointments).mock.calls[0][0]).toMatchObject({
      date: '2026-01-01',
      page: 1,
      limit: 100,
    });
    expect(vi.mocked(api.listAppointments).mock.calls[1][0]).toMatchObject({ page: 2 });
    expect(ctx.appointments.map(a => a.id)).toEqual(['a1', 'a2']);
    expect(ctx.appointmentsState).toBe('ready');
    expect(ctx.appointmentsTruncated).toBe(false);
  });

  it('respeita o cap de 10 páginas e sinaliza agenda truncada', async () => {
    await renderSettled();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    api.listAppointments.mockReset();
    api.listAppointments.mockImplementation((_params, _signal) =>
      Promise.resolve(
        page([rawAppt('a')], { total: 1200, page: 1, limit: 100, totalPages: 12 })
      )
    );

    await act(async () => {
      await ctx.refreshAppointments('2026-01-01');
    });

    expect(api.listAppointments).toHaveBeenCalledTimes(10);
    expect(ctx.appointmentsTruncated).toBe(true);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('resposta antiga chegando depois não sobrescreve o estado', async () => {
    await renderSettled();
    api.listAppointments.mockReset();

    let resolvePrimeira!: (v: unknown) => void;
    const primeira = new Promise(resolve => {
      resolvePrimeira = resolve;
    });
    api.listAppointments
      .mockImplementationOnce(() => primeira as Promise<never>)
      .mockResolvedValue(page([rawAppt('nova')], { total: 1, page: 1, limit: 100, totalPages: 1 }));

    // Inicia a consulta antiga e, sem aguardar, dispara a nova (que resolve primeiro).
    const antigaPromise = ctx.refreshAppointments('2026-01-01');
    await act(async () => {
      await ctx.refreshAppointments('2026-01-02');
    });

    // A antiga só resolve depois — deve ser descartada.
    await act(async () => {
      resolvePrimeira(page([rawAppt('antiga')], { total: 1, page: 1, limit: 100, totalPages: 1 }));
      await antigaPromise;
    });

    expect(ctx.appointments.map(a => a.id)).toEqual(['nova']);
  });

  it('erro com dados existentes mantém dados e marca stale', async () => {
    await renderSettled();
    api.listAppointments.mockReset();
    api.listAppointments.mockResolvedValue(
      page([rawAppt('a1')], { total: 1, page: 1, limit: 100, totalPages: 1 })
    );
    await act(async () => {
      await ctx.refreshAppointments('2026-01-01');
    });
    expect(ctx.appointments).toHaveLength(1);

    api.listAppointments.mockRejectedValueOnce(new Error('falha'));
    await act(async () => {
      await ctx.refreshAppointments('2026-01-02');
    });

    expect(ctx.appointmentsState).toBe('error');
    expect(ctx.appointmentsError).toBeTruthy();
    expect(ctx.appointments.map(a => a.id)).toEqual(['a1']);
    expect(ctx.appointmentsStale).toBe(true);
  });

  it('erro inicial define status error com lista vazia (sem stale)', async () => {
    api.listAppointments.mockReset();
    api.listAppointments.mockRejectedValue(new Error('offline'));
    api.getAvailability.mockResolvedValue([]);

    renderProvider();
    await waitFor(() => expect(ctx.appointmentsState).toBe('error'));

    expect(ctx.appointments).toEqual([]);
    expect(ctx.appointmentsStale).toBe(false);
  });

  it('sucesso com array vazio marca ready com lista vazia legítima', async () => {
    await renderSettled();

    expect(ctx.appointmentsState).toBe('ready');
    expect(ctx.appointments).toEqual([]);
    expect(ctx.appointmentsError).toBeNull();
    expect(ctx.appointmentsStale).toBe(false);
  });
});
