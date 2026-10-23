/// <reference types="vitest/globals" />
import {
  buildCoverSrcSet,
  buildCoverSourceUrl,
  buildCoverUrl,
  coverObjectPosition,
} from './coverImage';

const base =
  'https://res.cloudinary.com/demo/image/upload/v1792564621/agendaja/11111111-1111-1111-1111-111111111111/cover/cover.jpg';

describe('coverImage (helper único de entrega da capa)', () => {
  it('monta URL com recorte 16:9, focal em px do original e largura', () => {
    const url = buildCoverUrl(base, {
      width: 1600,
      focalX: 50,
      focalY: 0,
      originalWidth: 3840,
      originalHeight: 2160,
    });
    expect(url).toContain(
      '/image/upload/c_fill,ar_16:9,g_xy_center,x_1920,y_0,w_1600,f_auto,q_auto/',
    );
    expect(url.endsWith('/v1792564621/agendaja/11111111-1111-1111-1111-111111111111/cover/cover.jpg')).toBe(
      true,
    );
  });

  it('centro 50/50 (ou ausente) vira g_auto', () => {
    expect(buildCoverUrl(base, { focalX: 50, focalY: 50, originalWidth: 100, originalHeight: 100 })).toContain('g_auto');
    expect(buildCoverUrl(base, {})).toContain('g_auto');
  });

  it('sem dimensões originais o focal degrada para g_auto (nunca URL inválida)', () => {
    expect(buildCoverUrl(base, { focalX: 20, focalY: 80 })).toContain('g_auto');
  });

  it('não amplia além do original', () => {
    const url = buildCoverUrl(base, { width: 1600, originalWidth: 800, originalHeight: 450 });
    expect(url).toContain('w_800');
  });

  it('srcset cresce até o limite do original', () => {
    const set = buildCoverSrcSet(base, { originalWidth: 800, originalHeight: 450 });
    expect(set).toContain('640w');
    expect(set).not.toContain('960w');
    // Abaixo da menor largura da lista: entrega o próprio cap (nunca amplia).
    const tiny = buildCoverSrcSet(base, { originalWidth: 500, originalHeight: 282 });
    expect(tiny).toContain('500w');
  });

  it('editor recebe URL sem recorte (só f_auto/q_auto/w_)', () => {
    const url = buildCoverSourceUrl(base, { originalWidth: 3840, originalHeight: 2160 });
    expect(url).toContain('/image/upload/f_auto,q_auto,w_1280/');
    expect(url).not.toContain('c_fill');
  });

  it('URL fora do Cloudinary passa intacta (sem transforms)', () => {
    expect(buildCoverUrl('https://cdn.example.com/capa.png', { width: 900 })).toBe(
      'https://cdn.example.com/capa.png',
    );
    expect(buildCoverSrcSet('https://cdn.example.com/capa.png')).toBe('');
  });

  it('object-position clampa 0–100 e cai em 50% 50% para ausente/inválido', () => {
    expect(coverObjectPosition(46, 4)).toBe('46% 4%');
    expect(coverObjectPosition(undefined, null)).toBe('50% 50%');
    expect(coverObjectPosition(Number.NaN, 250)).toBe('50% 100%');
    expect(coverObjectPosition(-10, Number.NaN)).toBe('0% 50%');
  });
});
