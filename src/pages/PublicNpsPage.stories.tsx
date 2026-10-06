import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { fireEvent, within } from 'storybook/test';
import PublicNpsPage from './PublicNpsPage';
import type { NpsSurveyPublic } from '../infra/npsApi';

const SURVEY_ID = 'np-1';

const survey: NpsSurveyPublic = {
  id: SURVEY_ID,
  status: 'PENDING',
  shopName: 'Barbearia Central',
  destinationMasked: '*********3333',
  expiresAt: '2026-10-19T00:00:00.000Z',
};

/** `GET /api/nps/np-1` → envelope `{ success, data }` (o wrapper devolve o corpo cru). */
const surveyOk = http.get(`/api/nps/${SURVEY_ID}`, () =>
  HttpResponse.json({ success: true, data: survey })
);

const mswHandlers = [surveyOk];

const meta = {
  title: 'Públicas/PublicNpsPage',
  component: PublicNpsPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={[`/nps/${SURVEY_ID}`]}>
        <Routes>
          <Route path="/nps/:surveyId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof PublicNpsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Pesquisa carregada (`GET /api/nps/np-1` → `{ success, data }`) com o formulário pronto para responder. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
    await canvas.findByText(/anônima para \*+3333/, {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: 'Enviar resposta' }, { timeout: 10000 });
  },
};

/**
 * Falha do envio (`POST /api/nps/np-1` → 500 `{ success: false, message }`):
 * banner inline de erro no formulário (site futuro do SectionError) e o
 * formulário permanece na tela.
 */
export const ErroEnvio: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.post(`/api/nps/${SURVEY_ID}`, () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível enviar sua resposta.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
    await fireEvent.click(
      await canvas.findByRole('button', { name: 'Nota 5' }, { timeout: 10000 })
    );
    await fireEvent.click(canvas.getByRole('checkbox'));
    await fireEvent.click(canvas.getByRole('button', { name: 'Enviar resposta' }));
    await canvas.findByText(/Não foi possível enviar sua resposta/, {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: 'Enviar resposta' }, { timeout: 10000 });
  },
};
