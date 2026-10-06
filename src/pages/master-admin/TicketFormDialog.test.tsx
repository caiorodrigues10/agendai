/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { TicketFormDialog } from './TicketFormDialog';
import { adminInternalApi } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: {
    createTicket: vi.fn(),
    listTeam: vi.fn(),
  },
}));

const createTicket = vi.mocked(adminInternalApi.createTicket);

function setup(props: Partial<ComponentProps<typeof TicketFormDialog>> = {}) {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  const onError = vi.fn();
  render(
    <TicketFormDialog open onClose={onClose} onSaved={onSaved} onError={onError} {...props} />,
  );
  return { onClose, onSaved, onError };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TicketFormDialog', () => {
  it('cria chamado com dados válidos e avisa sucesso', async () => {
    createTicket.mockResolvedValue({} as Awaited<ReturnType<typeof createTicket>>);
    const { onSaved, onError } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText('Título'), {
      target: { value: 'Erro ao abrir a agenda' },
    });
    fireEvent.change(within(dialog).getByLabelText('Descrição'), {
      target: { value: 'O painel trava ao selecionar o profissional.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar chamado' }));

    await waitFor(() =>
      expect(createTicket).toHaveBeenCalledWith({
        title: 'Erro ao abrir a agenda',
        description: 'O painel trava ao selecionar o profissional.',
        category: 'QUESTION',
        priority: 'NORMAL',
        channel: 'OTHER',
      }),
    );
    expect(onSaved).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('valida título e descrição obrigatórios antes de enviar', async () => {
    const { onSaved } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar chamado' }));

    expect(await within(dialog).findByText('Informe o título.')).toBeInTheDocument();
    expect(within(dialog).getByText('Descreva o problema.')).toBeInTheDocument();
    expect(createTicket).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('mantém o formulário aberto e reporta erro da API', async () => {
    createTicket.mockRejectedValue(new Error('falha inesperada'));
    const { onSaved, onError } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText('Título'), { target: { value: 'Chamado' } });
    fireEvent.change(within(dialog).getByLabelText('Descrição'), { target: { value: 'Detalhe' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar chamado' }));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.any(String)));
    const alert = await within(dialog).findByRole('alert');
    expect(alert).not.toBeEmptyDOMElement();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('fecha sem criar quando o diálogo é cancelado', async () => {
    const { onClose, onSaved } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(createTicket).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
