/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShopPageTheme } from './ShopPageTheme';
import { usePageTheme } from './usePageTheme';
import type { PageTheme } from '../../infra/pageThemeApi';

vi.mock('./usePageTheme', () => ({
  usePageTheme: vi.fn(),
}));

const shop = '11111111-1111-1111-1111-111111111111';

const baseTheme: PageTheme = {
  id: 'theme-1',
  barbershopId: shop,
  presetKey: 'esmeralda',
  accentColor: '#2CB58A',
  backgroundColor: '#0F1110',
  surfaceColor: '#1B1F1D',
  textColor: '#F2F5F3',
  textMutedColor: '#8B9990',
  radiusStyle: 'rounded',
  buttonStyle: 'filled',
  coverUrl: null,
  coverPublicId: null,
  coverOverlay: 40,
};

function mockTheme(theme: PageTheme | null) {
  vi.mocked(usePageTheme).mockReturnValue({ loading: false, theme, applyTheme: vi.fn() });
}

function renderPublic() {
  return render(
    <ShopPageTheme barbershopId={shop}>
      <div data-testid="child" />
    </ShopPageTheme>
  );
}

describe('ShopPageTheme (capa da página pública)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza a capa com transforms do focal e object-position', () => {
    mockTheme({
      ...baseTheme,
      coverUrl:
        'https://res.cloudinary.com/demo/image/upload/v1/agendaja/11111111-1111-1111-1111-111111111111/cover/cover.jpg',
      coverPublicId: 'agendaja/11111111-1111-1111-1111-111111111111/cover/cover',
      coverFocalX: 50,
      coverFocalY: 0,
      coverWidth: 3840,
      coverHeight: 2160,
    });
    renderPublic();

    const img = screen.getByTestId('shop-page-cover').querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toContain('g_xy_center,x_1920,y_0');
    expect(img?.getAttribute('srcset')).toContain('w_640');
    expect(img?.style.objectPosition).toBe('50% 0%');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('focal ausente/inválido cai em 50% 50% (g_auto) — nunca NaN na URL', () => {
    mockTheme({
      ...baseTheme,
      coverUrl:
        'https://res.cloudinary.com/demo/image/upload/v1/agendaja/11111111-1111-1111-1111-111111111111/cover/cover.jpg',
      coverWidth: 1600,
      coverHeight: 900,
    });
    renderPublic();

    const img = screen.getByTestId('shop-page-cover').querySelector('img');
    expect(img?.getAttribute('src')).toContain('g_auto');
    expect(img?.getAttribute('src')).not.toContain('NaN');
    expect(img?.style.objectPosition).toBe('50% 50%');
  });

  it('imagem quebrada (404) vira gradiente do tema — sem ícone de imagem quebrada', () => {
    mockTheme({
      ...baseTheme,
      coverUrl:
        'https://res.cloudinary.com/demo/image/upload/v1/agendaja/11111111-1111-1111-1111-111111111111/cover/cover.jpg',
    });
    renderPublic();

    const img = screen.getByTestId('shop-page-cover').querySelector('img');
    expect(img).not.toBeNull();
    fireEvent.error(img!);

    expect(screen.getByTestId('shop-page-cover').querySelector('img')).toBeNull();
    expect(screen.getByTestId('shop-page-cover-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('sem capa não renderiza o bloco de capa', () => {
    mockTheme(baseTheme);
    renderPublic();
    expect(screen.queryByTestId('shop-page-cover')).toBeNull();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('sem tema salvo renderiza filhos intactos', () => {
    mockTheme(null);
    renderPublic();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByTestId('shop-page-cover')).toBeNull();
  });
});
