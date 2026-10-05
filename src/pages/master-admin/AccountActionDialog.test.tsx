/// <reference types="vitest/globals" />
import type { ComponentProps } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountActionDialog } from './AccountActionDialog';
import { plansApi } from '../../infra/plansApi';

vi.mock('../../infra/plansApi', () => ({
  plansApi: { list: vi.fn(), get: vi.fn() },
}));

function renderDialog(overrides: Partial<ComponentProps<typeof AccountActionDialog>> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <AccountActionDialog
      open
      title="Suspender conta"
      message="Mensagem de confirmação."
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onConfirm, onCancel };
}

describe('AccountActionDialog', () => {
  afterEach(() => vi.clearAllMocks());

  it('mantém o confirmar desabilitado até o motivo ter 10 caracteres', () => {
    renderDialog();
    const confirm = screen.getByRole('button', { name: 'Confirmar' });
    const reason = screen.getByPlaceholderText(/Por que esta ação/);

    expect(confirm).toBeDisabled();

    fireEvent.change(reason, { target: { value: 'curto' } });
    expect(confirm).toBeDisabled();

    fireEvent.change(reason, { target: { value: 'motivo com mais de dez' } });
    expect(confirm).toBeEnabled();
  });

  it('envia o motivo aparado no onConfirm', () => {
    const { onConfirm } = renderDialog();

    fireEvent.change(screen.getByPlaceholderText(/Por que esta ação/), {
      target: { value: '  suspeira de fraude  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(onConfirm).toHaveBeenCalledWith('suspeira de fraude', {});
  });

  it('pede os dias no modo extend-trial e os envia', () => {
    const { onConfirm } = renderDialog({ extra: 'days', confirmLabel: 'Estender' });

    fireEvent.change(screen.getByLabelText(/Dias de trial/), { target: { value: '14' } });
    fireEvent.change(screen.getByPlaceholderText(/Por que esta ação/), {
      target: { value: 'pedido do sucesso comercial' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Estender' }));

    expect(onConfirm).toHaveBeenCalledWith('pedido do sucesso comercial', { days: 14 });
  });

  it('lista os planos ativos no modo change-plan', async () => {
    vi.mocked(plansApi.list).mockResolvedValue([
      { id: 'plan-a', name: 'Essencial', description: null, price: 99, maxEmployees: 3, features: [] },
      { id: 'plan-b', name: 'Pro', description: null, price: 199, maxEmployees: 10, features: [] },
    ]);
    const { onConfirm } = renderDialog({ extra: 'plans', confirmLabel: 'Trocar plano' });

    await waitFor(() => expect(screen.getByLabelText(/Novo plano/)).toBeInTheDocument());
    const select = screen.getByLabelText(/Novo plano/) as HTMLSelectElement;
    expect(select.options).toHaveLength(2);

    fireEvent.change(select, { target: { value: 'plan-b' } });
    fireEvent.change(screen.getByPlaceholderText(/Por que esta ação/), {
      target: { value: 'upgrade solicitado pelo cliente' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Trocar plano' }));

    expect(onConfirm).toHaveBeenCalledWith('upgrade solicitado pelo cliente', {
      planId: 'plan-b',
    });
  });
});
