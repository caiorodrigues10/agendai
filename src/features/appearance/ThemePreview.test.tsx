/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemePreview } from './ThemePreview';
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
