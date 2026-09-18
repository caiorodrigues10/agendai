/// <reference types="vitest/globals" />
import { apiClient } from './apiClient';
import { clientPortalApi } from './clientPortalApi';

vi.mock('./apiClient', () => ({ apiClient: vi.fn() }));

const request = vi.mocked(apiClient);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe('clientPortalApi path mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ success: true, data: [] }))
    );
  });

  it('requests OTP on the registered portal path', async () => {
    request.mockResolvedValue({ success: true, data: {} });
    await clientPortalApi.requestCode('11999999999', 'Ana');
    expect(request).toHaveBeenCalledWith('/api/client/portal/request-otp', 'POST', {
      phone: '11999999999',
      name: 'Ana',
    });
  });

  it('verifies OTP and stores the client access token', async () => {
    request.mockResolvedValue({
      success: true,
      data: { accessToken: 'access-1', refreshToken: 'refresh-1', identity: { id: 'id-1' } },
    });
    await clientPortalApi.verifyCode('11999999999', '123456');
    expect(request).toHaveBeenCalledWith('/api/client/portal/verify-otp', 'POST', {
      phone: '11999999999',
      code: '123456',
    });
    expect(localStorage.getItem('agendai_client_portal_access')).toBe('access-1');
  });

  it('loads identity, links, care instructions and unlink on client portal paths', async () => {
    await clientPortalApi.getMe();
    await clientPortalApi.getSalons();
    await clientPortalApi.getCareInstructions();
    await clientPortalApi.unlinkSalon('link-1');
    await clientPortalApi.requestLink('11111111-1111-4111-8111-111111111111');

    const fetchMock = vi.mocked(fetch);
    const paths = fetchMock.mock.calls.map(call => String(call[0]));
    expect(paths).toEqual([
      '/api/client/portal/me',
      '/api/client/portal/my-links',
      '/api/client/portal/my-care-instructions',
      '/api/client/portal/my-links/link-1/revoke',
      '/api/client/portal/request-link',
    ]);
  });

  it('reads appointments from the client dashboard aggregate', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        success: true,
        data: {
          recentAppointments: [
            {
              id: 'appt-1',
              date: '2026-09-20',
              time: '10:00',
              status: 'CONFIRMED',
              service: { name: 'Corte', price: 45 },
              staff: { name: 'João' },
              barbershop: { name: 'Studio' },
            },
          ],
        },
      }) as Response
    );

    const appointments = await clientPortalApi.getAppointments('shop-1');
    expect(fetch).toHaveBeenCalledWith(
      '/api/client/portal/dashboard?barbershopId=shop-1',
      expect.objectContaining({ headers: expect.any(Headers) })
    );
    expect(appointments).toEqual([
      {
        id: 'appt-1',
        barbershopName: 'Studio',
        serviceName: 'Corte',
        staffName: 'João',
        date: '2026-09-20',
        time: '10:00',
        status: 'CONFIRMED',
        price: 45,
      },
    ]);
  });

  it('does not call a dedicated benefits endpoint', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ success: true, data: {} }) as Response);
    await expect(clientPortalApi.getBenefits('shop-1')).resolves.toEqual([]);
    expect(vi.mocked(fetch).mock.calls.map(call => String(call[0]))).toEqual([
      '/api/client/portal/dashboard?barbershopId=shop-1',
    ]);
  });
});
