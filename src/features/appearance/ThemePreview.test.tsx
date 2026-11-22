/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemePreview } from './ThemePreview';
import { PREVIEW_DEVICES } from './previewMockup';
import type { ContrastCheck } from '../../shared/pageThemeContrast';

const theme = {
  presetKey: null,
  accentColor: '#2CB58A',
  backgroundColor: '#0F1110',
  surfaceColor: '#1B1F1D',
  textColor: '#F2F5F3',
  textMutedColor: '#8B9990',
  radiusStyle: 'rounded' as const,
  buttonStyle: 'filled' as const,
  coverOverlay: 40,
  coverUrl: null,
  coverPublicId: null,
};

const failing: ContrastCheck[] = [];

function renderPreview(props: Partial<React.ComponentProps<typeof ThemePreview>> = {}) {
  return render(
    <ThemePreview
      theme={theme}
      shopName="Barba Nova"
      failing={failing}
      dirty={false}
      autoActive
      onAuto={() => undefined}
      onApplySuggestion={() => undefined}
      {...props}
    />
  );
}

describe('ThemePreview', () => {
  it('moldura tem aria de imagem pública e o conteúdo é inert (não focável)', () => {
    renderPreview();
    const frame = screen.getByTestId('preview-frame');
    expect(frame).toHaveAttribute('role', 'img');
    expect(frame).toHaveAttribute('aria-label', 'Prévia da página pública');

    const content = screen.getByTestId('theme-preview');
    const inertTarget = content.querySelector('[inert]') ?? content.closest('[inert]');
    expect(inertTarget).not.toBeNull();
    expect(content).toHaveClass('@container');
    expect(content).toHaveAttribute('data-preview-width', '390');
    expect(screen.getByText('Barba Nova')).toBeInTheDocument();
  });

  it('o tema (raio/cor) fica escopado no mockup e NÃO na moldura', () => {
    renderPreview({ theme: { ...theme, radiusStyle: 'squared' } });
    const frame = screen.getByTestId('preview-frame');
    expect(frame).not.toHaveAttribute('data-radius');
    expect(frame.style.borderRadius).toBe('');

    const content = screen.getByTestId('theme-preview');
    expect(content).toHaveAttribute('data-radius', 'squared');
    expect(content.style.getPropertyValue('--ag-accent')).toBe('#2CB58A');
    // variáveis não vazam: a moldura fora do preview não as recebe
    expect(screen.getByTestId('preview-column').style.getPropertyValue('--ag-accent')).toBe('');
  });

  it('alterna entre mobile e desktop com testids dos mockups', () => {
    renderPreview();
    expect(screen.getByTestId('device-mobile')).toBeInTheDocument();
    expect(screen.queryByTestId('device-desktop')).toBeNull();

    fireEvent.click(screen.getByTestId('preview-device-desktop'));
    expect(screen.getByTestId('device-desktop')).toBeInTheDocument();
    expect(screen.queryByTestId('device-mobile')).toBeNull();
    expect(screen.getByText('agendaja.com/queue/seu-salao')).toBeInTheDocument();
    expect(screen.getByTestId('preview-device-desktop')).toHaveAttribute('aria-pressed', 'true');
  });

  it('renderiza o mobile com 390 px lógicos e rolagem própria', () => {
    renderPreview();

    expect(PREVIEW_DEVICES.mobile.contentW).toBe(390);
    expect(PREVIEW_DEVICES.mobile.contentH).toBe(823);
    const content = screen.getByTestId('theme-preview');
    expect(content).toHaveAttribute('data-preview-width', '390');
    // rolagem da prévia: interna, única e contida (a coluna não rola em lg;
    // abaixo de lg a página rola até a moldura)
    expect(content.querySelector('[data-ag-preview-scroll]')).toHaveClass(
      'overflow-y-auto',
      'overscroll-contain'
    );

    const heading = screen.getByText('Barba Nova');
    expect(heading).toHaveClass('text-lg', '@min-[640px]:text-2xl');
  });

  it('coluna externa não rola e a tela interna é o único rolável', () => {
    renderPreview();

    const column = screen.getByTestId('preview-column');
    const tokens = column.className.split(/\s+/);
    // a coluna nunca tem overflow: abaixo de lg é auto-altura (a página rola
    // até a moldura) e em lg a moldura é dimensionada para caber na altura fixa
    expect(tokens.some(t => t.includes('overflow-y-auto'))).toBe(false);
    expect(tokens).toContain('lg:h-[calc(100dvh-8rem)]');

    // wrapper da moldura: flex-1 em lg (ocupa o espaço restante), min-h-0
    const fit = screen.getByTestId('preview-frame-fit');
    expect(fit).toHaveClass('min-h-0', 'lg:flex-1');
    expect(fit.contains(screen.getByTestId('preview-frame'))).toBe(true);

    // dentro da coluna, apenas a tela interna do mockup tem rolagem por classe
    const scrollables = Array.from(column.querySelectorAll<HTMLElement>('*')).filter(
      el =>
        typeof el.className === 'string' && el.className.split(/\s+/).includes('overflow-y-auto')
    );
    expect(scrollables).toHaveLength(1);
    expect(scrollables[0]).toHaveAttribute('data-ag-preview-scroll');
  });

  it('mantém o desktop em 1024 px lógicos e legível, com scroll próprio', () => {
    renderPreview();

    fireEvent.click(screen.getByTestId('preview-device-desktop'));
    const content = screen.getByTestId('theme-preview');
    expect(content).toHaveAttribute('data-preview-width', '1024');
    expect(screen.getByTestId('preview-frame')).toHaveStyle({ aspectRatio: '1024 / 1100' });
    expect(content.querySelector('[data-ag-preview-scroll]')).toHaveClass('overflow-y-auto');
    expect(screen.getByText('Barba Nova')).toHaveClass('@min-[640px]:text-2xl');
  });

  it('mantém os controles da prévia com alvo de toque de 44 px', () => {
    renderPreview();

    for (const testId of [
      'preview-variant-auto',
      'preview-variant-light',
      'preview-variant-dark',
      'preview-device-mobile',
      'preview-device-desktop',
      'preview-collapse',
    ]) {
      expect(screen.getByTestId(testId)).toHaveClass('min-h-11');
    }
    expect(screen.getByTestId('preview-device-mobile')).toHaveClass('min-w-11');
    expect(screen.getByTestId('preview-device-desktop')).toHaveClass('min-w-11');
  });

  it('botão de colapso existe abaixo de lg com aria-expanded', () => {
    renderPreview();
    const collapse = screen.getByTestId('preview-collapse');
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(collapse);
    expect(collapse).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('preview-frame')).toBeNull();
    // avisos continuam visíveis mesmo com a prévia oculta
    expect(screen.getByTestId('contrast-status')).toBeInTheDocument();
  });

  it('mostra avisos de contraste e "não salvos" abaixo da moldura', () => {
    const check = {
      key: 'text-background',
      ratio: 1,
      minRatio: 4.5,
      leftLabel: 'Texto',
      rightLabel: 'Fundo',
      suggestion: null,
    } as unknown as ContrastCheck;
    renderPreview({ failing: [check], dirty: true });
    const column = screen.getByTestId('preview-column');
    const status = screen.getByTestId('contrast-status');
    const frame = screen.getByTestId('preview-frame');
    expect(column.contains(status)).toBe(true);
    expect(column.contains(frame)).toBe(true);
    // moldura vem antes; avisos ficam abaixo dela na coluna
    expect(frame.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(status.textContent).toContain('WCAG AA');
    expect(screen.getByTestId('dirty-warning')).toHaveTextContent('Alterações não salvas');
  });
});
