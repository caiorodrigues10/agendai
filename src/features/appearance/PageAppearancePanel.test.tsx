/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PageAppearancePanel } from './PageAppearancePanel';
import { pageThemeApi, type PageTheme } from '../../infra/pageThemeApi';
import { clearPageThemeCache } from './usePageTheme';

vi.mock('../../infra/pageThemeApi', () => ({
  pageThemeApi: {
    getPublic: vi.fn(),
    update: vi.fn(),
    uploadCover: vi.fn(),
    deleteCover: vi.fn(),
  },
}));

const shop = '11111111-1111-1111-1111-111111111111';

const savedTheme: PageTheme = {
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

async function renderPanel() {
  const utils = render(<PageAppearancePanel barbershopId={shop} shopName="Barba Nova" />);
  await screen.findByTestId('save-theme');
  return utils;
}

function setHex(fieldLabel: string, hex: string) {
  fireEvent.change(screen.getByLabelText(`${fieldLabel} (hex)`), { target: { value: hex } });
}

describe('PageAppearancePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearPageThemeCache();
    vi.mocked(pageThemeApi.getPublic).mockResolvedValue(savedTheme);
    vi.mocked(pageThemeApi.update).mockImplementation(async (_id, payload) => ({
      ...savedTheme,
      ...payload,
    }));
  });

  it('carrega o tema salvo e reflete no preview', async () => {
    await renderPanel();
    expect(pageThemeApi.getPublic).toHaveBeenCalledWith(shop);
    const preview = screen.getByTestId('theme-preview');
    expect(preview).toHaveAttribute('data-radius', 'rounded');
    expect(screen.getByText('Entrar na fila').closest('button')).toHaveStyle({
      backgroundColor: 'rgb(44, 181, 138)',
    });
  });

  it('muda a cor de destaque e o preview acompanha em tempo real', async () => {
    await renderPanel();
    setHex('Cor de destaque', '#A78BFA');
    expect(screen.getByText('Entrar na fila').closest('button')).toHaveStyle({
      backgroundColor: 'rgb(167, 139, 250)',
    });
    expect(screen.getByTestId('dirty-warning')).toBeInTheDocument();
  });

  it('aplica uma paleta pronta ao clicar no preset', async () => {
    await renderPanel();
    fireEvent.click(screen.getByTestId('preset-claro'));
    expect(screen.getByTestId('theme-preview')).toHaveAttribute('data-ag-shop-theme');
    expect(screen.getByText('Entrar na fila').closest('button')).toHaveStyle({
      backgroundColor: 'rgb(28, 126, 97)',
    });
  });

  it('bloqueia Salvar e mostra o par reprovado quando o contraste falha', async () => {
    await renderPanel();
    setHex('Cor do texto', '#0F1110'); // igual ao fundo → contraste 1:1

    const status = screen.getByTestId('contrast-status');
    await waitFor(() => expect(status.textContent).toContain('Texto × Fundo'));
    expect(status.textContent).toContain('WCAG AA');
    expect(screen.getByTestId('save-theme')).toBeDisabled();
  });

  it('a sugestão de contraste corrige a cor e reabilita o Salvar', async () => {
    await renderPanel();
    setHex('Cor do texto', '#0F1110');
    const suggestion = await screen.findByTestId('suggestion-text-background');
    fireEvent.click(suggestion);

    await waitFor(() => expect(screen.getByTestId('save-theme')).toBeEnabled());
    fireEvent.click(screen.getByTestId('save-theme'));

    await waitFor(() => expect(pageThemeApi.update).toHaveBeenCalledTimes(1));
    const payload = vi.mocked(pageThemeApi.update).mock.calls[0][1];
    expect(payload.textColor).toMatch(/^#(FFFFFF|000000)$/);
  });

  it('Restaurar padrão volta as cores ao tema atual salvo', async () => {
    await renderPanel();
    setHex('Cor de destaque', '#A78BFA');
    expect(screen.getByTestId('dirty-warning')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('restore-defaults'));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar' }));

    await waitFor(() => expect(screen.queryByTestId('dirty-warning')).toBeNull());
    expect(screen.getByText('Entrar na fila').closest('button')).toHaveStyle({
      backgroundColor: 'rgb(44, 181, 138)',
    });
  });

  it('salva o tema no backend e limpa o estado sujo', async () => {
    await renderPanel();
    setHex('Cor de destaque', '#A78BFA');
    fireEvent.click(screen.getByTestId('save-theme'));

    await waitFor(() => expect(pageThemeApi.update).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByTestId('dirty-warning')).toBeNull());
    const payload = vi.mocked(pageThemeApi.update).mock.calls[0][1];
    expect(payload).toMatchObject({ accentColor: '#A78BFA', coverOverlay: 40 });
  });

  it('sem tema salvo, parte do visual padrão (zero regressão)', async () => {
    vi.mocked(pageThemeApi.getPublic).mockResolvedValue(null);
    await renderPanel();
    expect(screen.getByText('Entrar na fila').closest('button')).toHaveStyle({
      backgroundColor: 'rgb(44, 181, 138)',
    });
    expect(screen.getByTestId('save-theme')).toBeDisabled(); // nada alterado ainda
  });
});
