/// <reference types="vitest/globals" />
import {
  buildCoverOgUrl,
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

  describe('buildCoverOgUrl (coerente com a rota og-image, nunca amplia)', () => {
    it('origem grande entrega 1200×630 em JPEG q_auto (PNG ~900KB, JPEG ~80KB)', () => {
      const url = buildCoverOgUrl(base, {
        originalWidth: 3840,
        originalHeight: 2160,
        focalX: 50,
        focalY: 50,
      });
      expect(url).toContain('w_1200,h_630,c_fill,g_auto,f_jpg,q_auto');
      expect(url).not.toContain('f_png');
    });

    it('3000×600 (muito larga) não amplia: corta para 1142×600', () => {
      const url = buildCoverOgUrl(base, { originalWidth: 3000, originalHeight: 600 });
      expect(url).toContain('w_1142,h_600,c_fill');
      expect(url).toContain('f_jpg,q_auto');
    });

    it('600×3000 (muito alta) não amplia: corta para 600×315', () => {
      const url = buildCoverOgUrl(base, { originalWidth: 600, originalHeight: 3000 });
      expect(url).toContain('w_600,h_315,c_fill');
      expect(url).toContain('f_jpg,q_auto');
    });

    it('aplica o mesmo focal da página (g_xy_center em px do original)', () => {
      const url = buildCoverOgUrl(base, {
        originalWidth: 3000,
        originalHeight: 600,
        focalX: 0,
        focalY: 100,
      });
      expect(url).toContain('g_xy_center');
      expect(url).not.toContain('g_auto');
    });

    it('fora do Cloudinary a URL passa intacta', () => {
      expect(buildCoverOgUrl('https://cdn.example.com/capa.png', { originalWidth: 600 })).toBe(
        'https://cdn.example.com/capa.png',
      );
    });
  });
});
