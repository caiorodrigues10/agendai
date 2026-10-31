import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExtendTrialFields } from './ExtendTrialFields';
import { adminAccountActionsApi } from '../../infra/adminAccountActionsApi';

vi.mock('../../infra/adminAccountActionsApi', () => ({
  adminAccountActionsApi: { accountAction: vi.fn() },
}));
const action = vi.mocked(adminAccountActionsApi.accountAction);
beforeEach(() => {
  action.mockReset();
});

function setup(canExtend = true) {
  const onExtended = vi.fn();
  const onSubmit = vi.fn(event => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <ExtendTrialFields
        shopId="shop-1"
        shopName="Salão Central"
        canExtend={canExtend}
        onExtended={onExtended}
      />
    </form>
  );
  if (canExtend) fireEvent.click(screen.getByRole('button', { name: 'Adicionar dias' }));
  return { onExtended, onSubmit };
}

describe('ExtendTrialFields', () => {
  it('posts the selected number of days and audit reason without saving the user form', async () => {
    action.mockResolvedValue({ success: true, data: {} });
    const { onExtended, onSubmit } = setup();
    fireEvent.change(screen.getByLabelText(/Dias para adicionar/), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText(/Motivo da extensão/), {
      target: { value: '  Liberação autorizada de teste  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar dias' }));
    await waitFor(() => expect(onExtended).toHaveBeenCalledWith(90));
    expect(action).toHaveBeenCalledWith('shop-1', 'extend-trial', {
      days: 90,
      reason: 'Liberação autorizada de teste',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it.each(['0', '91', '1.5', ''])('does not send invalid days (%s)', value => {
    setup();
    fireEvent.change(screen.getByLabelText(/Dias para adicionar/), { target: { value } });
    fireEvent.change(screen.getByLabelText(/Motivo da extensão/), {
      target: { value: 'Motivo válido para auditoria' },
    });
    expect(screen.getByRole('button', { name: 'Confirmar dias' })).toBeDisabled();
    expect(action).not.toHaveBeenCalled();
  });
  it('requires an audit reason of at least ten non-whitespace characters', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Motivo da extensão/), {
      target: { value: '  curto  ' },
    });
    expect(screen.getByRole('button', { name: 'Confirmar dias' })).toBeDisabled();
  });
  it('keeps an API error visible and does not report success', async () => {
    action.mockRejectedValue(new Error('Só é possível estender assinaturas em trial'));
    const { onExtended } = setup();
    fireEvent.change(screen.getByLabelText(/Motivo da extensão/), {
      target: { value: 'Motivo válido para auditoria' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar dias' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Só é possível estender');
    expect(onExtended).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Confirmar dias' })).toBeEnabled();
  });
  it('explains the route restriction for paid or missing subscriptions', () => {
    setup(false);
    expect(screen.getByRole('button', { name: 'Adicionar dias' })).toBeDisabled();
    expect(screen.getByText(/Disponível para assinaturas em período grátis/)).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });
});
