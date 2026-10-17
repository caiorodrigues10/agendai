/// <reference types="vitest/globals" />
import { COVER_IMAGE_SPEC } from '../shared/imageSpecs';

const shop = '11111111-1111-1111-1111-111111111111';
const validUrl = `https://res.cloudinary.com/demo/image/upload/agendaja/${shop}/cover/cover`;

vi.mock('./apiClient', () => ({
  apiClient: vi.fn(),
  apiFetch: vi.fn(),
}));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));

import { apiClient, apiFetch } from './apiClient';
import { pageThemeApi, type PageThemeInput } from './pageThemeApi';

const theme = {
  id: 'theme-1',
  barbershopId: shop,
  presetKey: null,
  accentColor: '#2CB58A',
  backgroundColor: '#0F1110',
  surfaceColor: '#1B1F1D',
  textColor: '#F2F5F3',
  textMutedColor: '#8B9990',
  radiusStyle: 'rounded',
  buttonStyle: 'filled',
  coverUrl: validUrl,
  coverPublicId: `agendaja/${shop}/cover/cover`,
  coverOverlay: 40,
};

describe('pageThemeApi contracts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET público usa a rota page-theme (sem token)', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: theme });
    const result = await pageThemeApi.getPublic(shop);
    expect(result).toMatchObject({ barbershopId: shop });
    expect(apiClient).toHaveBeenCalledWith(`/api/barbershops/${shop}/page-theme`);
  });

  it('GET público aceita data null (salão sem tema)', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: null });
    await expect(pageThemeApi.getPublic(shop)).resolves.toBeNull();
  });

  it('GET público vira null quando o mock genérico devolve data [] (shape inválido)', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: [] });
    await expect(pageThemeApi.getPublic(shop)).resolves.toBeNull();
  });

  it('GET público vira null quando data não é um tema (objeto de outro recurso)', async () => {
    vi.mocked(apiClient).mockResolvedValue({
      success: true,
      data: { id: shop, name: 'Salão E2E', whatsapp: '11999999999' },
    });
    await expect(pageThemeApi.getPublic(shop)).resolves.toBeNull();
  });

  it('GET público vira null quando falta um campo essencial do tema', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: { ...theme, accentColor: undefined } });
    await expect(pageThemeApi.getPublic(shop)).resolves.toBeNull();
  });

  it('PUT envia payload com token de owner', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: theme });
    const payload: PageThemeInput = {
      presetKey: null,
      accentColor: '#2CB58A',
      backgroundColor: '#0F1110',
      surfaceColor: '#1B1F1D',
      textColor: '#F2F5F3',
      textMutedColor: '#8B9990',
      radiusStyle: 'rounded',
      buttonStyle: 'filled',
      coverOverlay: 40,
    };
    await pageThemeApi.update(shop, payload);
    expect(apiClient).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/page-theme`,
      'PUT',
      payload,
      'test-token'
    );
  });

  it('uploadCover faz multipart no endpoint /cover com campo "cover"', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: theme }),
    } as Response);
    const file = new File(['x'], 'capa.png', { type: 'image/png' });
    const result = await pageThemeApi.uploadCover(shop, file);
    expect(result.coverUrl).toBe(validUrl);
    const [url, init, token] = vi.mocked(apiFetch).mock.calls[0];
    expect(url).toBe(`/api/barbershops/${shop}/page-theme/cover`);
    expect(init.method).toBe('POST');
    expect((init.body as FormData).get('cover')).toBe(file);
    expect(token).toBe('test-token');
  });

  it('uploadCover traduz erro do back para Error com mensagem', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ success: false, message: 'Sua imagem tem 1200×800.' }),
    } as Response);
    await expect(
      pageThemeApi.uploadCover(shop, new File(['x'], 'x.png', { type: 'image/png' }))
    ).rejects.toThrowError('Sua imagem tem 1200×800.');
  });

  it('DELETE remove a capa', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: { ...theme, coverUrl: null } });
    await pageThemeApi.deleteCover(shop);
    expect(apiClient).toHaveBeenCalledWith(
      `/api/barbershops/${shop}/page-theme/cover`,
      'DELETE',
      undefined,
      'test-token'
    );
  });
});

// sanity: a spec de capa continua 16:9 com mínimo 1600×900 (espelho do back)
describe('COVER_IMAGE_SPEC (espelho)', () => {
  it('mantém as dimensões publicadas na UI', () => {
    expect(COVER_IMAGE_SPEC.recommendedWidth).toBe(1920);
    expect(COVER_IMAGE_SPEC.recommendedHeight).toBe(1080);
    expect(COVER_IMAGE_SPEC.minWidth).toBe(1600);
    expect(COVER_IMAGE_SPEC.maxBytes).toBe(5 * 1024 * 1024);
  });
});
