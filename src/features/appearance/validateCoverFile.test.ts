/// <reference types="vitest/globals" />
import { validateCoverFile } from './validateCoverFile';

function fakeFile(options: { type?: string; size?: number; name?: string } = {}): File {
  const bytes = new Uint8Array(options.size ?? 1024);
  return new File([bytes], options.name ?? 'capa.png', { type: options.type ?? 'image/png' });
}

function stubBitmap(width: number, height: number) {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width, height, close: vi.fn() }))
  );
}

describe('validateCoverFile (validação instantânea do uploader)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('aceita capa 1920×1080 PNG', async () => {
    stubBitmap(1920, 1080);
    await expect(validateCoverFile(fakeFile())).resolves.toMatchObject({
      ok: true,
      width: 1920,
      height: 1080,
    });
  });

  it('aceita capa mínima 1600×900', async () => {
    stubBitmap(1600, 900);
    await expect(validateCoverFile(fakeFile())).resolves.toMatchObject({ ok: true });
  });

  it('recusa 1200×800 com a mensagem de dimensão', async () => {
    stubBitmap(1200, 800);
    const result = await validateCoverFile(fakeFile());
    expect(result.ok).toBe(false);
    expect(result.error).toContain('1200×800');
  });

  it('recusa proporção errada (1920×1200) mesmo dentro do peso', async () => {
    stubBitmap(1920, 1200);
    const result = await validateCoverFile(fakeFile());
    expect(result.ok).toBe(false);
    expect(result.error).toContain('16:9');
  });

  it('recusa arquivo acima de 5 MB antes de ler dimensões', async () => {
    const result = await validateCoverFile(fakeFile({ size: 6 * 1024 * 1024 }));
    expect(result.ok).toBe(false);
    expect(result.error).toContain('6');
    expect(result.error).toContain('5 MB');
  });

  it('recusa MIME não permitido (GIF) sem tocar no decoder', async () => {
    const decode = vi.fn();
    vi.stubGlobal('createImageBitmap', decode);
    const result = await validateCoverFile(fakeFile({ type: 'image/gif' }));
    expect(result.ok).toBe(false);
    expect(result.error).toContain('JPG, PNG, WebP');
    expect(decode).not.toHaveBeenCalled();
  });

  it('recusa quando a imagem não pode ser decodificada', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => {
        throw new Error('decode failed');
      })
    );
    const result = await validateCoverFile(fakeFile());
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Não foi possível ler a imagem');
  });
});
