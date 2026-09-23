/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SupportPanel } from './SupportPanel';
import { supportApi, SupportReport } from '../../infra/supportApi';
import { SupportReportSchema } from '../../schemas';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS_LABELS,
  toSupportCategory,
} from './support/supportLabels';

vi.mock('../../infra/supportApi', () => ({
  supportApi: {
    createReport: vi.fn(),
    listMyReports: vi.fn(),
    getReport: vi.fn(),
    addComment: vi.fn(),
  },
}));

const emptyList = {
  success: true,
  data: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
};

const report: SupportReport = {
  id: 'r1',
  protocol: 'AG-1234',
  title: 'Fila não atualiza após check-in',
  category: 'ERROR',
  priority: 'NORMAL',
  status: 'OPEN',
  createdAt: '2026-09-23T10:00:00.000Z',
  updatedAt: '2026-09-23T10:00:00.000Z',
  _count: { comments: 0 },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(supportApi.listMyReports).mockResolvedValue(
    emptyList as Awaited<ReturnType<typeof supportApi.listMyReports>>
  );
});

it('renderiza o cabeçalho, o formulário e o estado vazio da lista', async () => {
  render(<SupportPanel />);
  expect(screen.getByRole('heading', { name: 'Ajuda e suporte' })).toBeInTheDocument();
  expect(screen.getByLabelText(/^Título/)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Descrição/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Bug ou erro/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enviar relatório/ })).toBeInTheDocument();
  await waitFor(() => expect(supportApi.listMyReports).toHaveBeenCalled());
  expect(await screen.findByText('Nenhum relatório ainda')).toBeInTheDocument();
});

it('mostra erros de validação ao enviar o formulário vazio', async () => {
  render(<SupportPanel />);
  fireEvent.click(screen.getByRole('button', { name: /Enviar relatório/ }));
  expect(await screen.findByText('Selecione uma categoria')).toBeInTheDocument();
  expect(screen.getByText(/pelo menos 5 caracteres/)).toBeInTheDocument();
  expect(screen.getByText(/pelo menos 10 caracteres/)).toBeInTheDocument();
  expect(supportApi.createReport).not.toHaveBeenCalled();
});

it('envia o relatório com a categoria mapeada e mostra o protocolo', async () => {
  vi.mocked(supportApi.createReport).mockResolvedValue(report);
  render(<SupportPanel />);
  fireEvent.click(screen.getByLabelText(/Bug ou erro/));
  fireEvent.change(screen.getByLabelText(/^Título/), {
    target: { value: 'Fila quebrada' },
  });
  fireEvent.change(screen.getByLabelText(/^Descrição/), {
    target: { value: 'A fila não atualiza quando faço check-in dos clientes.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Enviar relatório/ }));
  await waitFor(() =>
    expect(supportApi.createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Fila quebrada',
        description: 'A fila não atualiza quando faço check-in dos clientes.',
        category: 'ERROR',
        priority: 'NORMAL',
      })
    )
  );
  expect(await screen.findByText(/Protocolo AG-1234 gerado/)).toBeInTheDocument();
});

it('abre o detalhe do relatório a partir da lista', async () => {
  vi.mocked(supportApi.listMyReports).mockResolvedValue({
    success: true,
    data: [report],
    meta: { total: 1, page: 1, limit: 10, totalPages: 0 },
  } as Awaited<ReturnType<typeof supportApi.listMyReports>>);
  vi.mocked(supportApi.getReport).mockResolvedValue({
    ...report,
    description: 'A fila congela após o check-in do terceiro cliente da tarde.',
    comments: [
      {
        id: 'c1',
        text: 'Recebemos seu relatório, estamos verificando.',
        createdAt: '2026-09-23T11:00:00.000Z',
        author: { name: 'Suporte' },
      },
    ],
  });
  render(<SupportPanel />);
  fireEvent.click(await screen.findByRole('button', { name: /AG-1234/ }));
  await waitFor(() => expect(supportApi.getReport).toHaveBeenCalledWith('r1'));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(
    await screen.findByText('A fila congela após o check-in do terceiro cliente da tarde.')
  ).toBeInTheDocument();
  expect(screen.getByText('Recebemos seu relatório, estamos verificando.')).toBeInTheDocument();
});

it('valida o schema do formulário de suporte', () => {
  const base = { category: 'BUG', priority: 'NORMAL', title: 'Erro na fila', description: 'Detalhe do problema reportado' };
  expect(SupportReportSchema.safeParse(base).success).toBe(true);
  expect(SupportReportSchema.safeParse({ ...base, title: 'Erro' }).success).toBe(false);
  expect(SupportReportSchema.safeParse({ ...base, description: 'curto' }).success).toBe(false);
  expect(
    SupportReportSchema.safeParse({ ...base, category: undefined, title: base.title, description: base.description })
      .success
  ).toBe(false);
});

it('expõe rótulos PT-BR e mapeia categorias do formulário para o backend', () => {
  expect(SUPPORT_CATEGORY_LABELS.ERROR).toBe('Bug ou erro');
  expect(SUPPORT_CATEGORY_LABELS.BILLING).toBe('Cobrança');
  expect(SUPPORT_CATEGORY_LABELS.SCHEDULE).toBe('Agendamento');
  expect(SUPPORT_STATUS_LABELS.OPEN).toBe('Aberto');
  expect(SUPPORT_STATUS_LABELS.WAITING_SHOP).toBe('Aguardando você');
  expect(toSupportCategory('BUG')).toBe('ERROR');
  expect(toSupportCategory('WRONG_DATA')).toBe('ERROR');
  expect(toSupportCategory('SUGGESTION')).toBe('SUGGESTION');
  expect(toSupportCategory('QUESTION')).toBe('QUESTION');
});
