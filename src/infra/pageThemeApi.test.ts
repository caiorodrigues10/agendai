/// <reference types="vitest/globals" />
import { COVER_IMAGE_SPEC } from '../shared/imageSpecs';

const shop = '11111111-1111-1111-1111-111111111111';
const validUrl = `https://res.cloudinary.com/demo/image/upload/agendaja/${shop}/cover/cover`;

vi.mock('./apiClient', () => ({
  apiClient: vi.fn(),
  apiFetch: vi.fn(),
}));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));
vi.mock('./cloudinaryDirectUpload', () => ({
  CloudinaryUploadError: class CloudinaryUploadError extends Error {
    signatureExpired: boolean;
    canceled: boolean;
    constructor(message: string, options?: { signatureExpired?: boolean; canceled?: boolean }) {
      super(message);
      this.name = 'CloudinaryUploadError';
      this.signatureExpired = options?.signatureExpired ?? false;
      this.canceled = options?.canceled ?? false;
    }
  },
  uploadToCloudinary: vi.fn(),
}));

import { apiClient } from './apiClient';
import { CloudinaryUploadError, uploadToCloudinary } from './cloudinaryDirectUpload';
import { pageThemeApi, type PageThemeInput } from './pageThemeApi';

const credentials = {
  cloudName: 'devv5blyc',
  apiKey: 'api-key',
  uploadUrl: 'https://api.cloudinary.com/v1_1/devv5blyc/image/upload',
  folder: `agendaja/${shop}/cover`,
  publicId: `agendaja/${shop}/cover/cover`,
  timestamp: 1792564621,
  signature: 'sig',
  expiresInSeconds: 600,
  params: { signature: 'sig', api_key: 'api-key' },
};
const uploaded = { publicId: credentials.publicId, version: 1792564621, secureUrl: validUrl };

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

  it('uploadCover: assina no back, sobe no Cloudinary e confirma preservando as focais', async () => {
    const themeWithFocals = { ...theme, coverFocalX: 46, coverFocalY: 4 };
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ success: true, data: credentials })
      .mockResolvedValueOnce({ success: true, data: themeWithFocals });
    vi.mocked(uploadToCloudinary).mockResolvedValue(uploaded);

    const result = await pageThemeApi.uploadCover(
      shop,
      new File(['x'], 'capa.png', { type: 'image/png' })
    );

    expect(apiClient).toHaveBeenNthCalledWith(
      1,
      `/api/barbershops/${shop}/uploads/sign`,
      'POST',
      { kind: 'cover' },
      'test-token'
    );
    expect(uploadToCloudinary).toHaveBeenCalledTimes(1);
    expect(vi.mocked(uploadToCloudinary).mock.calls[0][1]).toMatchObject({
      file: expect.any(File),
    });
    expect(apiClient).toHaveBeenNthCalledWith(
      2,
      `/api/barbershops/${shop}/page-theme/cover/confirm`,
      'POST',
      { publicId: uploaded.publicId, version: uploaded.version },
      'test-token'
    );
    expect(result.coverUrl).toBe(validUrl);
    expect(result.coverFocalX).toBe(46);
    expect(result.coverFocalY).toBe(4);
  });

  it('uploadCover propaga o erro do confirm com a mensagem do back', async () => {
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ success: true, data: credentials })
      .mockRejectedValueOnce(new Error('Sua imagem tem 1200×800.'));
    vi.mocked(uploadToCloudinary).mockResolvedValue(uploaded);

    await expect(
      pageThemeApi.uploadCover(shop, new File(['x'], 'x.png', { type: 'image/png' }))
    ).rejects.toThrowError('Sua imagem tem 1200×800.');
  });

  it('uploadCover re-assina UMA vez quando a assinatura do Cloudinary expira', async () => {
    const themeWithFocals = { ...theme, coverFocalX: 46, coverFocalY: 4 };
    vi.mocked(apiClient)
      .mockResolvedValueOnce({ success: true, data: credentials })
      .mockResolvedValueOnce({ success: true, data: credentials })
      .mockResolvedValueOnce({ success: true, data: themeWithFocals });
    vi.mocked(uploadToCloudinary)
      .mockRejectedValueOnce(new CloudinaryUploadError('Assinatura expirada.', { signatureExpired: true }))
      .mockResolvedValueOnce(uploaded);

    const result = await pageThemeApi.uploadCover(
      shop,
      new File(['x'], 'capa.png', { type: 'image/png' })
    );

    expect(apiClient).toHaveBeenCalledTimes(3);
    expect(uploadToCloudinary).toHaveBeenCalledTimes(2);
    expect(result.coverFocalX).toBe(46);
    expect(result.coverFocalY).toBe(4);
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

// sanity: a spec de capa continua 16:9 com recomendado 1920×1080 (espelho do back)
describe('COVER_IMAGE_SPEC (espelho)', () => {
  it('mantém as dimensões publicadas na UI', () => {
    expect(COVER_IMAGE_SPEC.recommended.width).toBe(1920);
    expect(COVER_IMAGE_SPEC.recommended.height).toBe(1080);
    expect(COVER_IMAGE_SPEC.recommended.aspect).toBe('16:9');
    expect(COVER_IMAGE_SPEC.maxBytes).toBe(5 * 1024 * 1024);
  });
});
