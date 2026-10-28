/// <reference types="vitest/globals" />
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SocialLinksSection } from './SocialLinksSection';
import { useBarbershop } from '../../contexts/BarbershopContext';
import type { SocialLinks } from '../../utils/socialLinks';

vi.mock('../../contexts/BarbershopContext', () => ({
  useBarbershop: vi.fn(),
}));

const setSocialLinks = vi.fn();
function setup(initialLinks?: SocialLinks | null) {
  vi.mocked(useBarbershop).mockReturnValue({
    setSocialLinks,
  } as never);
  const onNotify = vi.fn();
  render(<SocialLinksSection initialLinks={initialLinks} onNotify={onNotify} />);
  return { onNotify };
}

beforeEach(() => {
  vi.clearAllMocks();
  setSocialLinks.mockResolvedValue(null);
});

describe('SocialLinksSection', () => {
  it('mostra as 5 redes com placeholder de @usuário ou link', () => {
    setup();
    for (const label of ['Instagram', 'TikTok', 'X', 'YouTube', 'Facebook']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText('Instagram')).toHaveAttribute(
      'placeholder',
      expect.stringContaining('@seuinstagram')
    );
  });

  it('valida na hora: host de outra rede mostra mensagem clara e trava o Salvar', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Instagram'), {
      target: { value: 'facebook.com/x' },
    });
    expect(
      screen.getByText('O link do Instagram precisa ser de instagram.com')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('mostra preview do link canônico para @usuário', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Instagram'), {
      target: { value: '@meubarbeiro' },
    });
    expect(screen.getByTestId('social-preview-instagram')).toHaveTextContent(
      'https://instagram.com/meubarbeiro'
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });

  it('salva o mapa com todos os campos (vazio = remove) e avisa sucesso', async () => {
    setSocialLinks.mockResolvedValue({ instagram: 'https://instagram.com/meubarbeiro' });
    const { onNotify } = setup();
    fireEvent.change(screen.getByLabelText('Instagram'), {
      target: { value: '@meubarbeiro' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(setSocialLinks).toHaveBeenCalledWith({
        instagram: '@meubarbeiro',
        tiktok: '',
        x: '',
        youtube: '',
        facebook: '',
      })
    );
    expect(onNotify).toHaveBeenCalledWith('Redes sociais salvas.', 'success');
    // O que voltou do backend (canônico) vira o valor dos campos.
    await waitFor(() =>
      expect(screen.getByLabelText('Instagram')).toHaveValue('https://instagram.com/meubarbeiro')
    );
  });

  it('exibe o erro da API no toast quando o save falha', async () => {
    setSocialLinks.mockRejectedValue(new Error('boom'));
    const { onNotify } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onNotify).toHaveBeenCalledWith(expect.any(String), 'error'));
  });

  it('botão Limpar zera o campo da rede', () => {
    setup({ instagram: 'https://instagram.com/antiga' });
    expect(screen.getByLabelText('Instagram')).toHaveValue('https://instagram.com/antiga');
    fireEvent.click(screen.getByRole('button', { name: 'Limpar link do Instagram' }));
    expect(screen.getByLabelText('Instagram')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpar link do Instagram' })).not.toBeInTheDocument();
  });
});
