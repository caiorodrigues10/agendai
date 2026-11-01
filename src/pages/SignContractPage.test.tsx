/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SignContractPage } from './SignContractPage';
import { casesApi } from '../infra/casesApi';

vi.mock('../infra/casesApi', () => ({
  casesApi: {
    getPublicContract: vi.fn(),
    signContract: vi.fn(),
    declineContract: vi.fn(),
  },
}));

function renderPage(token = 'token-1') {
  return render(
    <MemoryRouter initialEntries={[`/assinar/${token}`]}>
      <Routes>
        <Route path="/assinar/:token" element={<SignContractPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(casesApi.getPublicContract).mockResolvedValue({
    contractTitle: 'Contrato de honorários',
    contractType: 'FEE_AGREEMENT',
    content: 'Cláusulas do contrato',
    fileUrl: null,
    signerName: 'Maria Souza',
    status: 'PENDING',
    signedAt: null,
  });
});

it('mostra o documento e o nome de quem vai assinar, sem dados do processo', async () => {
  renderPage();

  expect(await screen.findByText('Contrato de honorários')).toBeVisible();
  expect(screen.getByText(/Maria Souza/)).toBeVisible();
  expect(screen.getByText('Cláusulas do contrato')).toBeVisible();
  // sigilo: nada de número de processo ou apelido interno
  expect(screen.queryByText(/Ação de cobrança/)).toBeNull();
});

it('registra a assinatura digitada', async () => {
  vi.mocked(casesApi.signContract).mockResolvedValue({
    contractId: 'contract-1',
    signedAt: '2026-10-29T12:00:00.000Z',
  });

  renderPage();
  await screen.findByText('Contrato de honorários');

  const input = screen.getByLabelText('Nome para assinatura') as HTMLInputElement;
  input.value = 'Maria Souza';
  input.dispatchEvent(new Event('input', { bubbles: true }));

  const form = screen.getByRole('button', { name: 'Assinar documento' });
  form.click();

  await waitFor(() =>
    expect(casesApi.signContract).toHaveBeenCalledWith('token-1', {
      typedName: 'Maria Souza',
    })
  );
});

it('avisa quando o link de assinatura é inválido', async () => {
  vi.mocked(casesApi.getPublicContract).mockRejectedValue(new Error('Link de assinatura inválido'));

  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('Link de assinatura inválido');
});

it('não oferece assinar quando a assinatura já foi registrada', async () => {
  vi.mocked(casesApi.getPublicContract).mockResolvedValue({
    contractTitle: 'Contrato de honorários',
    contractType: 'FEE_AGREEMENT',
    content: null,
    fileUrl: null,
    signerName: 'Maria Souza',
    status: 'SIGNED',
    signedAt: '2026-10-29T12:00:00.000Z',
  });

  renderPage();

  expect(await screen.findByText('Assinatura registrada')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Assinar documento' })).toBeNull();
});
