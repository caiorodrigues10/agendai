/**
 * Decisão de composição: esta story dirige o `ShopCreateWizard` completo em vez
 * de um harness local do `WizardFormBody`. O formulário tem 9 campos, mas só 4
 * exigem digitação (nome, WhatsApp, nome e e-mail do dono) — CNPJ e endereço são
 * opcionais, o plano vem pré-selecionado do `GET /api/plans` e o trial já nasce
 * em 30 dias. Todos os controles são nativos (nenhum SmartSelect), então o play
 * consegue percorrer as 5 etapas e submeter de forma estável.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { ShopCreateWizard } from './ShopCreateWizard';
import { authStorage } from '../../infra/authStorage';
import type { Plan } from '../../infra/plansApi';

const plans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Pro',
    description: null,
    price: 20,
    billingCycle: 'MONTHLY',
    maxEmployees: 0,
    features: [],
    active: true,
  },
];

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const plansOk = http.get('/api/plans', () => json(plans));

const mswHandlers = [plansOk];

/**
 * Semeia o access token (`adminApi.getAuthHeader()` lança "Não autenticado"
 * sem ele, antes mesmo do fetch) e limpa ao desmontar: o test-runner usa uma
 * única página/contexto, então o sessionStorage vaza entre stories sem este
 * cleanup.
 */
const StoryFrame = ({ children }: { children: ReactNode }) => {
  useEffect(
    () => () => {
      authStorage.clearTokens();
      authStorage.clearUser();
    },
    []
  );
  return <>{children}</>;
};

const meta = {
  title: 'MasterAdmin/ShopWizardSteps',
  component: ShopCreateWizard,
  tags: ['autodocs', 'test'],
  args: {
    open: true,
    onClose: () => undefined,
    onCreated: () => undefined,
  },
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      return (
        <MemoryRouter>
          <StoryFrame>
            <Story />
          </StoryFrame>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof ShopCreateWizard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O `ModalShell` renderiza via portal em `document.body` (fora do canvas). */
const openWizard = async () => {
  const body = within(document.body);
  const dialog = await body.findByRole('dialog', {}, { timeout: 10000 });
  return within(dialog);
};

/** Wizard aberto na 1ª etapa (GET /api/plans → 200): nenhuma falha; captura o modal "Novo salão". */
export const Default: Story = {
  play: async () => {
    const dialog = await openWizard();
    await dialog.findByText('Nome do salão', {}, { timeout: 10000 });
  },
};

/**
 * Falha da criação: `POST /api/admin/barbershops` responde 500 com
 * `{ success: false, message: 'Não foi possível criar o salão.' }`. O play
 * preenche as etapas com dados válidos, avança até a revisão e submete — o
 * banner `<p role="alert">` (ShopWizardSteps.tsx:227) exibe a `message` do
 * corpo dentro do diálogo.
 */
export const ErroSalvar: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.post('/api/admin/barbershops', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível criar o salão.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    const dialog = await openWizard();
    fireEvent.change(await dialog.findByLabelText(/Nome do salão/, {}, { timeout: 10000 }), {
      target: { value: 'Barbearia Nova' },
    });
    fireEvent.change(await dialog.findByLabelText(/^WhatsApp/, {}, { timeout: 10000 }), {
      target: { value: '11999990000' },
    });
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Avançar' }, { timeout: 10000 })
    );
    await dialog.findByText('2. Endereço e ajustes', {}, { timeout: 10000 });
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Avançar' }, { timeout: 10000 })
    );
    await dialog.findByText('3. Dono', {}, { timeout: 10000 });
    fireEvent.change(await dialog.findByLabelText(/Nome do dono/, {}, { timeout: 10000 }), {
      target: { value: 'Dono Teste' },
    });
    fireEvent.change(await dialog.findByLabelText(/E-mail do dono/, {}, { timeout: 10000 }), {
      target: { value: 'dono@teste.dev' },
    });
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Avançar' }, { timeout: 10000 })
    );
    await dialog.findByText('4. Plano e trial', {}, { timeout: 10000 });
    await waitFor(() => expect(dialog.getByLabelText('Plano')).toHaveValue('plan-1'), {
      timeout: 10000,
    });
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Avançar' }, { timeout: 10000 })
    );
    await dialog.findByText('5. Revisão', {}, { timeout: 10000 });
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Criar salão' }, { timeout: 10000 })
    );
    await dialog.findByText(/Não foi possível criar o salão/, {}, { timeout: 10000 });
  },
};
