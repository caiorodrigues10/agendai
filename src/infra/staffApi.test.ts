/// <reference types="vitest/globals" />
import { apiClient } from './apiClient';
import { staffApi } from './staffApi';

vi.mock('./apiClient', () => ({ apiClient: vi.fn() }));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));

const request = vi.mocked(apiClient);
const shop = '11111111-1111-1111-1111-111111111111';
const staffId = '22222222-2222-2222-2222-222222222222';
const scheduleId = '33333333-3333-3333-3333-333333333333';
const serviceId = '44444444-4444-4444-4444-444444444444';
const timeOffId = '55555555-5555-5555-5555-555555555555';

describe('staffApi contracts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes schedules with staffId query and body, not /staff/:id/schedules', async () => {
    request.mockResolvedValue({
      success: true,
      data: [{ id: scheduleId, staffId, dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true, createdAt: '', updatedAt: '' }],
    });
    await staffApi.getSchedules(shop, staffId);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/staff-schedules?staffId=${staffId}`,
      'GET',
      undefined,
      'test-token'
    );

    request.mockResolvedValue({
      success: true,
      data: { id: scheduleId, staffId, dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true, createdAt: '', updatedAt: '' },
    });
    await staffApi.upsertSchedule(shop, staffId, { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/staff-schedules`,
      'POST',
      { staffId, dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
      'test-token'
    );

    request.mockResolvedValue({ success: true });
    await staffApi.removeSchedule(shop, staffId, scheduleId);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/staff-schedules/${scheduleId}`,
      'DELETE',
      undefined,
      'test-token'
    );
  });

  it('assigns services with customTime and deletes via staffId/serviceId', async () => {
    request.mockResolvedValue({
      success: true,
      data: { id: 'svc', staffId, serviceId, customTime: 40, customPrice: 50, isActive: true, createdAt: '', service: { name: 'Barba' } },
    });
    const assigned = await staffApi.assignService(shop, staffId, {
      serviceId,
      customPrice: 50,
      customDuration: 40,
    });
    expect(assigned).toMatchObject({ serviceName: 'Barba', customTime: 40, customDuration: 40 });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/staff-services`,
      'POST',
      { staffId, serviceId, customPrice: 50, customTime: 40 },
      'test-token'
    );

    request.mockResolvedValue({ success: true });
    await staffApi.removeService(shop, staffId, serviceId);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/staff-services/${staffId}/${serviceId}`,
      'DELETE',
      undefined,
      'test-token'
    );
  });

  it('sends ISO startAt/endAt and PATCHes approve/reject', async () => {
    request.mockResolvedValue({
      success: true,
      data: {
        id: timeOffId,
        staffId,
        startAt: '2026-09-20T00:00:00.000Z',
        endAt: '2026-09-21T23:59:59.999Z',
        status: 'PENDING',
        createdAt: '',
        staff: { name: 'Ana' },
      },
    });
    const created = await staffApi.requestTimeOff(shop, staffId, {
      startDate: '2026-09-20',
      endDate: '2026-09-21',
      reason: 'Folga',
    });
    expect(created).toMatchObject({ staffName: 'Ana', startDate: '2026-09-20T00:00:00.000Z' });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/time-off`,
      'POST',
      {
        staffId,
        startAt: '2026-09-20T00:00:00.000Z',
        endAt: '2026-09-21T23:59:59.999Z',
        reason: 'Folga',
      },
      'test-token'
    );

    request.mockResolvedValue({ success: true, data: { ...created, status: 'APPROVED' } });
    await staffApi.approveTimeOff(shop, staffId, timeOffId);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/time-off/${timeOffId}/approve`,
      'PATCH',
      undefined,
      'test-token'
    );

    await staffApi.rejectTimeOff(shop, staffId, timeOffId);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/time-off/${timeOffId}/reject`,
      'PATCH',
      undefined,
      'test-token'
    );
  });
});
