/// <reference types="vitest/globals" />
import { apiClient } from './apiClient';
import { showcaseApi } from './showcaseApi';

vi.mock('./apiClient', () => ({ apiClient: vi.fn() }));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));

const request = vi.mocked(apiClient);
const shop = '11111111-1111-1111-1111-111111111111';
const entryId = '22222222-2222-2222-2222-222222222222';
const raw = {
  id: entryId,
  barbershopId: shop,
  postId: '33333333-3333-3333-3333-333333333333',
  title: 'Corte fade',
  mode: 'DIRECT_SERVICE',
  status: 'PUBLISHED',
  position: 0,
  post: { imageUrl: 'https://cdn/img.jpg', videoUrl: null },
  service: { name: 'Corte', price: 45 },
  staff: { name: 'João' },
};

describe('showcaseApi contracts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists public entries without the /public prefix', async () => {
    request.mockResolvedValue({ success: true, data: [raw] });
    const entries = await showcaseApi.getPublicShowcase(shop);
    expect(entries[0]).toMatchObject({
      id: entryId,
      mediaUrl: 'https://cdn/img.jpg',
      serviceName: 'Corte',
      staffName: 'João',
      servicePrice: 45,
    });
    expect(request).toHaveBeenCalledWith(`/api/barbershops/${shop}/showcase`, 'GET');
  });

  it('loads public detail and posts VIEW on the events path', async () => {
    request.mockResolvedValueOnce({ success: true, data: raw });
    await showcaseApi.getPublicEntry(shop, entryId);
    expect(request).toHaveBeenCalledWith(`/api/barbershops/${shop}/showcase/${entryId}`, 'GET');

    request.mockResolvedValueOnce({ success: true, data: { id: 'evt' } });
    await showcaseApi.trackEvent(shop, entryId, 'VIEW');
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/showcase-events/${entryId}`,
      'POST',
      { eventType: 'VIEW' }
    );
  });

  it('uses showcase-entries for staff list/create/patch and dedicated publish/hide/order/analytics', async () => {
    request.mockResolvedValue({ success: true, data: [raw] });
    await showcaseApi.listEntries(shop, { status: 'PUBLISHED' });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/showcase-entries?status=published`,
      'GET',
      undefined,
      'test-token'
    );

    request.mockResolvedValue({ success: true, data: raw });
    await showcaseApi.createEntry(shop, {
      postId: raw.postId,
      title: 'Corte fade',
      imageAuthorization: 'team_confirmed',
      mode: 'direct_service',
    });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/showcase-entries`,
      'POST',
      expect.objectContaining({ barbershopId: shop, postId: raw.postId, imageAuthorization: 'team_confirmed' }),
      'test-token'
    );

    await showcaseApi.publishEntry(shop, entryId);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/showcase-entries/${entryId}/publish`,
      'POST',
      undefined,
      'test-token'
    );

    await showcaseApi.hideEntry(shop, entryId);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/showcase-entries/${entryId}/hide`,
      'POST',
      undefined,
      'test-token'
    );

    request.mockResolvedValue({ success: true, message: 'Ordem atualizada' });
    await showcaseApi.reorder(shop, [{ id: entryId, position: 0 }]);
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/showcase-entries/order`,
      'PUT',
      { entries: [{ id: entryId, position: 0 }] },
      'test-token'
    );

    request.mockResolvedValue({ success: true, data: { totalViews: 1, totalClicks: 0, clickRate: 0, byType: {} } });
    await showcaseApi.getAnalytics(shop, { from: '2026-09-01' });
    expect(request).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/showcase-analytics?from=2026-09-01`,
      'GET',
      undefined,
      'test-token'
    );
  });
});
