import { render, screen, within } from '@testing-library/react';
import { ModalShell } from './ModalShell';

describe('ModalShell mobile focus', () => {
  it('starts focus on the close control instead of opening a mobile keyboard', () => {
    render(<ModalShell open title="Cliente" titleId="client-title" onClose={vi.fn()} />);
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar' }))
      .toHaveAttribute('data-autofocus', '');
  });
});
