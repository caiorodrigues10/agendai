/// <reference types="vitest/globals" />
import { apiClient } from './apiClient';
import { goalsApi } from './goalsApi';

vi.mock('./apiClient', () => ({ apiClient: vi.fn() }));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));

const request = vi.mocked(apiClient);
const shop = '11111111-1111-1111-1111-111111111111';
const goalId = '22222222-2222-2222-2222-222222222222';
const goal = {
  id: goalId,
  professionalId: '33333333-3333-3333-3333-333333333333',
  barbershopId: shop,
  metric: 'REVENUE' as const,
  target: '5000',
  period: 'MONTHLY',
  startDate: '2026-09-01T00:00:00.000Z',
  endDate: '2026-09-30T00:00:00.000Z',
};

describe('goalsApi contracts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads ranking instead of collection /goals/progress', async () => {
    request.mockResolvedValue({
      success: true,
      data: [{ goal, current: 2500, target: 5000, percentage: 50 }],
    });
    await expect(goalsApi.getRanking(shop)).resolves.toEqual([
      expect.objectContaining({
        id: goalId,
        current: 2500,
        target: 5000,
        percentage: 50,
        metric: 'REVENUE',
      }),
    ]);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/goals/ranking`,
      'GET',
      undefined,
      'test-token'
    );
  });

  it('loads per-goal progress with the goalId segment', async () => {
    request.mockResolvedValue({
      success: true,
      data: { goal, current: 10, target: 20, percentage: 50 },
    });
    await expect(goalsApi.getProgress(shop, goalId)).resolves.toMatchObject({
      id: goalId,
      current: 10,
      percentage: 50,
    });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/goals/${goalId}/progress`,
      'GET',
      undefined,
      'test-token'
    );
  });

  it('creates goals with the collection POST', async () => {
    request.mockResolvedValue({ success: true, data: goal });
    await goalsApi.create(shop, {
      professionalId: goal.professionalId,
      metric: 'REVENUE',
      target: 5000,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/goals`,
      'POST',
      expect.objectContaining({
        professionalId: goal.professionalId,
        period: 'MONTHLY',
        target: 5000,
      }),
      'test-token'
    );
  });
});
