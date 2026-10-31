import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ServiceForm } from './ServiceForm';

it('preserves entered data after an API error and disables dismissal while saving', async () => {
  let fail!: (error: Error) => void;
  const save = vi.fn(
    () =>
      new Promise<void>((_, reject) => {
        fail = reject;
      })
  );
  const close = vi.fn();
  render(<ServiceForm onSave={save} onCancel={close} />);
  fireEvent.change(screen.getByLabelText('Nome do Serviço'), { target: { value: 'Corte social' } });
  fireEvent.change(screen.getByLabelText('Preço (R$)'), { target: { value: '50' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(close).not.toHaveBeenCalled();
  fail(new Error('Falha ao salvar'));
  expect(await screen.findByText('Falha ao salvar')).toBeVisible();
  expect(screen.getByLabelText('Nome do Serviço')).toHaveValue('Corte social');
  expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
});
