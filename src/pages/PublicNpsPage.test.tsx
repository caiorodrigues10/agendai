/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicNpsPage from './PublicNpsPage';
import { npsApi, NpsSurveyPublic } from '../infra/npsApi';

vi.mock('../infra/npsApi', () => ({
  npsApi: { getSurvey: vi.fn(), answer: vi.fn() },
}));

const SURVEY_ID = '11111111-1111-4111-8111-111111111111';

const survey: NpsSurveyPublic = {
  id: SURVEY_ID,
  status: 'PENDING',
  shopName: 'Barbearia Central',
  destinationMasked: '*********3333',
  expiresAt: '2026-10-19T00:00:00.000Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/nps/${SURVEY_ID}`]}>
      <Routes>
        <Route path="/nps/:surveyId" element={<PublicNpsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicNpsPage', () => {
  afterEach(() => vi.clearAllMocks());

  it('carrega a pesquisa, envia nota com consentimento e agradece', async () => {
    vi.mocked(npsApi.getSurvey).mockResolvedValue({ success: true, data: survey });
    vi.mocked(npsApi.answer).mockResolvedValue({
      success: true,
      data: { surveyId: SURVEY_ID, barbershopId: 'b1', score: 9, comment: null },
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Barbearia Central' })).toBeInTheDocument();
    expect(screen.getByText(/anônima para \*+3333/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nota 9' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }));

    expect(await screen.findByText('Obrigado pela resposta')).toBeInTheDocument();
    expect(npsApi.answer).toHaveBeenCalledWith(
      SURVEY_ID,
      expect.objectContaining({ score: 9, lgpdAccepted: true }),
    );
  });

  it('bloqueia o envio sem consentimento LGPD', async () => {
    vi.mocked(npsApi.getSurvey).mockResolvedValue({ success: true, data: survey });

    renderPage();

    await screen.findByRole('heading', { name: 'Barbearia Central' });
    fireEvent.click(screen.getByRole('button', { name: 'Nota 7' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }));

    expect(
      await screen.findByText('Autorize o uso dos seus dados para enviar a resposta.'),
    ).toBeInTheDocument();
    expect(npsApi.answer).not.toHaveBeenCalled();
  });

  it('valida a nota obrigatória antes de enviar', async () => {
    vi.mocked(npsApi.getSurvey).mockResolvedValue({ success: true, data: survey });

    renderPage();

    await screen.findByRole('heading', { name: 'Barbearia Central' });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }));

    expect(await screen.findByText('Selecione uma nota de 0 a 10.')).toBeInTheDocument();
    expect(npsApi.answer).not.toHaveBeenCalled();
  });

  it('mostra pesquisa indisponível quando já respondida', async () => {
    vi.mocked(npsApi.getSurvey).mockResolvedValue({
      success: true,
      data: { ...survey, status: 'ANSWERED' },
    });

    renderPage();

    expect(await screen.findByText('Pesquisa já respondida')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enviar resposta' })).not.toBeInTheDocument();
  });

  it('mostra painel de erro quando o link não existe', async () => {
    vi.mocked(npsApi.getSurvey).mockRejectedValue(new Error('not found'));

    renderPage();

    expect(await screen.findByText('Pesquisa indisponível')).toBeInTheDocument();
  });

  it('mostra erro da API e mantém o formulário ao falhar o envio', async () => {
    vi.mocked(npsApi.getSurvey).mockResolvedValue({ success: true, data: survey });
    vi.mocked(npsApi.answer).mockRejectedValue(new Error('HTTP 409'));

    renderPage();

    await screen.findByRole('heading', { name: 'Barbearia Central' });
    fireEvent.click(screen.getByRole('button', { name: 'Nota 5' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }));

    await waitFor(() => expect(npsApi.answer).toHaveBeenCalled());
    expect(
      await screen.findByText('Não foi possível enviar sua resposta.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar resposta' })).toBeInTheDocument();
  });
});
