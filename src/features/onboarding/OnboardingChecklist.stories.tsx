import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn, userEvent, within } from 'storybook/test';
import { OnboardingChecklist } from './OnboardingChecklist';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const steps = [
  { key: 'PROFILE', label: 'Perfil do salão', completed: false, required: true },
  { key: 'SEGMENT', label: 'Segmento', completed: false, required: true },
  { key: 'SERVICES', label: 'Serviços', completed: false, required: true },
];

const onboarding = {
  steps,
  progress: 0,
  nextStep: 'PROFILE',
  completed: false,
  welcomeSeen: true,
  dismissed: false,
};

/** Falha do `GET /api/barbershops/:id/onboarding` (o mount chama `load()`). */
const getErro = () =>
  http.get('/api/barbershops/:id/onboarding', () =>
    HttpResponse.json(
      {
        success: false,
        message: 'Não foi possível carregar sua configuração inicial.',
      },
      { status: 500 }
    )
  );

/** Falha do `POST /api/barbershops/:id/onboarding/steps` (botão "Já configurei"). */
const postStepErro = () =>
  http.post('/api/barbershops/:id/onboarding/steps', () =>
    HttpResponse.json(
      { success: false, message: 'Conclua a configuração indicada antes de confirmar.' },
      { status: 500 }
    )
  );

const welcomeSeen = http.post('/api/barbershops/:id/onboarding/welcome-seen', () => json(null));
const getOk = http.get('/api/barbershops/:id/onboarding', () => json(onboarding));

const mswHandlers = [welcomeSeen, getOk];

const meta = {
  title: 'Onboarding/OnboardingChecklist',
  component: OnboardingChecklist,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
  args: {
    barbershopId: 'shop-1',
    shopName: 'Barbearia Central',
    onNavigate: fn(),
    onDone: fn(),
    onCompleted: fn(),
  },
} satisfies Meta<typeof OnboardingChecklist>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O wizard usa framer-motion (entrada da etapa + barra de progresso). */
const settleMotion = () => new Promise(resolve => setTimeout(resolve, 1500));

/** Carregamento inicial OK: wizard na primeira etapa pendente, sem banner de erro. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: /Vamos colocar/ }, { timeout: 10000 });
    await canvas.findByText('Confirme os dados do seu salão', {}, { timeout: 10000 });
    await settleMotion();
  },
};

/**
 * Falha do carregamento no mount (`GET /api/barbershops/:id/onboarding` → 500):
 * banner `role="alert"` inline com o fallback de `getErrorMessage` — estado que
 * será convertido para `SectionError`.
 */
export const Erro: Story = {
  parameters: {
    msw: { handlers: [welcomeSeen, getErro()] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      /Não foi possível carregar sua configuração inicial/,
      {},
      { timeout: 10000 }
    );
    await canvas.findByRole('alert', {}, { timeout: 10000 });
    await settleMotion();
  },
};

/**
 * Falha ao confirmar a etapa (`POST /api/barbershops/:id/onboarding/steps` → 500):
 * mesmo banner `role="alert"`, agora com a mensagem da ação de confirmar.
 */
export const ErroConfirmacao: Story = {
  parameters: {
    msw: { handlers: [welcomeSeen, getOk, postStepErro()] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: /Vamos colocar/ }, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Já configurei' }, { timeout: 10000 })
    );
    await canvas.findByText(/Conclua a configuração indicada/, {}, { timeout: 10000 });
    await settleMotion();
  },
};
