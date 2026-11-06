/// <reference types="vitest/globals" />
import { coverImageWarnings, validateCoverFile } from './validateCoverFile';

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

  it('aceita 1200×800 — medida fora do ideal não bloqueia o envio', async () => {
    stubBitmap(1200, 800);
    const result = await validateCoverFile(fakeFile());
    expect(result.ok).toBe(true);
    expect(result.width).toBe(1200);
    const warnings = coverImageWarnings(result.width, result.height).map(w => w.text).join(' ');
    expect(warnings).toContain('1200×800');
  });

  it('aceita 1920×1200 e emite aviso de proporção (não bloqueia)', async () => {
    stubBitmap(1920, 1200);
    const result = await validateCoverFile(fakeFile());
    expect(result.ok).toBe(true);
    const warnings = coverImageWarnings(result.width, result.height).map(w => w.text).join(' ');
    expect(warnings).toContain('16:9');
  });

  it('aceita arquivo acima de 5 MB — o peso é limite do plano, não do app', async () => {
    stubBitmap(1920, 1080);
    const result = await validateCoverFile(fakeFile({ size: 6 * 1024 * 1024 }));
    expect(result.ok).toBe(true);
  });

  it('recusa MIME não permitido (GIF) sem tocar no decoder', async () => {
    const decode = vi.fn();
    vi.stubGlobal('createImageBitmap', decode);
    const result = await validateCoverFile(fakeFile({ type: 'image/gif' }));
    expect(result.ok).toBe(false);
    expect(result.error).toContain('JPG, PNG ou WebP');
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

  it('alerta capa muito alongada (3000×600) com sugestão de foto horizontal', () => {
    const warnings = coverImageWarnings(3000, 600).map(w => w.text).join(' ');
    expect(warnings).toContain('muito alongada');
    expect(warnings).toContain('16:9');
    expect(warnings).toContain('1920×1080');
  });

  it('alerta capa vertical (600×3000) com sugestão de foto deitada', () => {
    const warnings = coverImageWarnings(600, 3000).map(w => w.text).join(' ');
    expect(warnings).toContain('vertical');
    expect(warnings).toContain('horizontal (16:9)');
    expect(warnings).toContain('foto deitada');
  });

  it('proporção fora do ideal mas sem extremo (1920×1200) não cai no alerta de alongada', () => {
    const warnings = coverImageWarnings(1920, 1200).map(w => w.text).join(' ');
    expect(warnings).not.toContain('muito alongada');
    expect(warnings).toContain('16:9');
  });
});
