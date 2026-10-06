import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('anuncia mensagens comuns numa região viva `status` (polite)', () => {
    render(<Toast message="Agendamento salvo" onClose={vi.fn()} />);

    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('Agendamento salvo');
  });

  it('anuncia erros numa região viva `alert` (assertive)', () => {
    render(<Toast message="Não foi possível salvar" type="error" onClose={vi.fn()} />);

    const region = screen.getByRole('alert');
    expect(region).toHaveAttribute('aria-live', 'assertive');
    expect(region).toHaveTextContent('Não foi possível salvar');
  });

  it('esconde o ícone decorativo dos leitores de tela', () => {
    render(<Toast message="Mensagem do bot" type="bot" onClose={vi.fn()} />);

    const region = screen.getByRole('status');
    expect(region.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(region.textContent).toContain('Mensagem do bot');
  });
});
