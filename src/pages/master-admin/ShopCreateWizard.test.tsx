/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ShopCreateWizard } from './ShopCreateWizard';
import { adminApi, BarbershopListItem } from '../../infra/adminApi';
import { plansApi, Plan } from '../../infra/plansApi';

vi.mock('../../infra/adminApi', () => ({
  adminApi: {
    listBarbershops: vi.fn(),
    createBarbershop: vi.fn(),
    resendOwnerInvite: vi.fn(),
  },
}));

vi.mock('../../infra/plansApi', () => ({
  plansApi: { list: vi.fn(), get: vi.fn() },
}));

const createBarbershop = vi.mocked(adminApi.createBarbershop);
const resendOwnerInvite = vi.mocked(adminApi.resendOwnerInvite);
const plansList = vi.mocked(plansApi.list);

const PLANS: Plan[] = [
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

const createdShop: BarbershopListItem = {
  id: 'shop-new',
  name: 'Barbearia Nova',
  cnpj: null,
  whatsapp: '11999990000',
  address: null,
  active: true,
  approvalStatus: 'APPROVED',
  createdAt: '2026-10-04T12:00:00.000Z',
  _count: { users: 0, appointments: 0, queue: 0 },
};

function DetailWithState() {
  const location = useLocation();
  return (
    <div>
      detalhe-conta
      <span data-testid="state-from">
        {String((location.state as { from?: string } | null)?.from ?? '')}
      </span>
    </div>
  );
}

function setup() {
  const onClose = vi.fn();
  const onCreated = vi.fn();
  render(
    <MemoryRouter initialEntries={['/master']}>
      <Routes>
        <Route
          path="/master"
          element={<ShopCreateWizard open onClose={onClose} onCreated={onCreated} />}
        />
        <Route path="/master/accounts/:id" element={<DetailWithState />} />
      </Routes>
    </MemoryRouter>,
  );
  return { onClose, onCreated };
}

const fillShopStep = (dialog: HTMLElement) => {
  fireEvent.change(within(dialog).getByLabelText(/Nome do salão/), {
    target: { value: 'Barbearia Nova' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^WhatsApp/), {
    target: { value: '11999990000' },
  });
};

const fillOwnerStep = (dialog: HTMLElement) => {
  fireEvent.change(within(dialog).getByLabelText(/Nome do dono/), {
    target: { value: 'Dono Teste' },
  });
  fireEvent.change(within(dialog).getByLabelText(/E-mail do dono/), {
    target: { value: 'dono@teste.dev' },
  });
};

const goToStep = async (dialog: HTMLElement, label: RegExp, times: number) => {
  for (let i = 0; i < times; i += 1) {
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
  }
  await within(dialog).findByText(label);
};

describe('ShopCreateWizard — validação de etapas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    plansList.mockResolvedValue(PLANS);
  });

  it('bloqueia avançar sem os campos obrigatórios', async () => {
    setup();
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await waitFor(() =>
      expect(within(dialog).getByText('Informe o nome do salão.')).toBeInTheDocument(),
    );
    expect(within(dialog).getByText('Informe o WhatsApp com DDD.')).toBeInTheDocument();
    expect(createBarbershop).not.toHaveBeenCalled();
  });

  it('valida formato do CNPJ', async () => {
    setup();
    const dialog = await screen.findByRole('dialog');
    fillShopStep(dialog);
    fireEvent.change(within(dialog).getByLabelText(/CNPJ/), { target: { value: '123' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await waitFor(() =>
      expect(within(dialog).getByText('O CNPJ deve ter 14 dígitos, sem pontuação.')).toBeInTheDocument(),
    );
  });

  it('exige nome e e-mail válidos do dono na etapa 3', async () => {
    setup();
    const dialog = await screen.findByRole('dialog');
    fillShopStep(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('2. Endereço e ajustes');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('3. Dono');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await waitFor(() => {
      expect(within(dialog).getByText('Informe o nome do dono.')).toBeInTheDocument();
      expect(within(dialog).getByText('Informe o e-mail do dono.')).toBeInTheDocument();
    });

    fillOwnerStep(dialog);
    fireEvent.change(within(dialog).getByLabelText(/E-mail do dono/), {
      target: { value: 'nao-eh-email' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await waitFor(() =>
      expect(within(dialog).getByText('E-mail inválido.')).toBeInTheDocument(),
    );
  });

  it('valida o limite de trial (60 dias)', async () => {
    setup();
    const dialog = await screen.findByRole('dialog');
    fillShopStep(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('2. Endereço e ajustes');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('3. Dono');
    fillOwnerStep(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('4. Plano e trial');
    await waitFor(() =>
      expect(within(dialog).getByLabelText('Plano')).toHaveValue('plan-1'),
    );

    fireEvent.change(within(dialog).getByLabelText(/Dias de trial/), {
      target: { value: '90' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await waitFor(() =>
      expect(within(dialog).getByText('Trial máximo: 60 dias.')).toBeInTheDocument(),
    );
  });

});

describe('ShopCreateWizard — criação e convite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    plansList.mockResolvedValue(PLANS);
  });

  it('percorre as etapas e cria o salão com dono, plano e trial', async () => {
    createBarbershop.mockResolvedValue({
      success: true,
      data: createdShop,
      owner: { id: 'owner-1', email: 'dono@teste.dev' },
      inviteSent: true,
    } as never);
    const { onCreated } = setup();
    const dialog = await screen.findByRole('dialog');

    fillShopStep(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('2. Endereço e ajustes');

    fireEvent.change(within(dialog).getByLabelText(/Endereço/), {
      target: { value: 'Rua das Flores, 123' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('3. Dono');
    fillOwnerStep(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('4. Plano e trial');
    await waitFor(() =>
      expect(within(dialog).getByLabelText('Plano')).toHaveValue('plan-1'),
    );

    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('5. Revisão');
    expect(within(dialog).getByText('Dono Teste · dono@teste.dev')).toBeInTheDocument();
    expect(within(dialog).getByText('Pro')).toBeInTheDocument();
    expect(within(dialog).getByText('30 dias')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar salão' }));
    await waitFor(() =>
      expect(createBarbershop).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Barbearia Nova',
          whatsapp: '11999990000',
          address: 'Rua das Flores, 123',
          active: true,
          owner: { name: 'Dono Teste', email: 'dono@teste.dev' },
          planId: 'plan-1',
          trialDays: 30,
        }),
      ),
    );
    expect(await within(dialog).findByText('Salão criado')).toBeInTheDocument();
    expect(within(dialog).getByText('Convite enviado.')).toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledWith(createdShop);
  });

  it('oferece reenvio do convite quando o e-mail não foi enviado', async () => {
    createBarbershop.mockResolvedValue({
      success: true,
      data: createdShop,
      owner: { id: 'owner-1', email: 'dono@teste.dev' },
      inviteSent: false,
    } as never);
    resendOwnerInvite.mockResolvedValue({
      success: true,
      data: { inviteSent: true },
    } as never);
    setup();
    const dialog = await screen.findByRole('dialog');

    fillShopStep(dialog);
    await goToStep(dialog, /2\. Endereço e ajustes/, 1);
    fireEvent.change(within(dialog).getByLabelText(/Endereço/), {
      target: { value: 'Rua das Flores, 123' },
    });
    await goToStep(dialog, /3\. Dono/, 1);
    fillOwnerStep(dialog);
    await goToStep(dialog, /4\. Plano e trial/, 1);
    await waitFor(() =>
      expect(within(dialog).getByLabelText('Plano')).toHaveValue('plan-1'),
    );
    await goToStep(dialog, /5\. Revisão/, 1);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar salão' }));

    expect(await within(dialog).findByText('Salão criado')).toBeInTheDocument();
    expect(within(dialog).getByText(/O convite não pôde ser enviado agora/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reenviar convite' }));
    await waitFor(() => expect(resendOwnerInvite).toHaveBeenCalledWith('shop-new'));
    expect(await within(dialog).findByText('Convite enviado.')).toBeInTheDocument();
  });

  it('navega para o detalhe da conta no botão Ver detalhes', async () => {
    createBarbershop.mockResolvedValue({
      success: true,
      data: createdShop,
      owner: { id: 'owner-1', email: 'dono@teste.dev' },
      inviteSent: true,
    } as never);
    setup();
    const dialog = await screen.findByRole('dialog');

    fillShopStep(dialog);
    await goToStep(dialog, /2\. Endereço e ajustes/, 1);
    await goToStep(dialog, /3\. Dono/, 1);
    fillOwnerStep(dialog);
    await goToStep(dialog, /4\. Plano e trial/, 1);
    await waitFor(() =>
      expect(within(dialog).getByLabelText('Plano')).toHaveValue('plan-1'),
    );
    await goToStep(dialog, /5\. Revisão/, 1);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar salão' }));
    await within(dialog).findByText('Salão criado');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Ver detalhes' }));
    expect(await screen.findByText('detalhe-conta')).toBeInTheDocument();
    // state.from preserva a rota de origem p/ o botão "Voltar" do detalhe
    expect(screen.getByTestId('state-from')).toHaveTextContent('/master');
  });

  it('permite voltar etapa e exibe erro da API', async () => {
    createBarbershop.mockRejectedValue(new Error('Já existe'));
    setup();
    const dialog = await screen.findByRole('dialog');
    fillShopStep(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('2. Endereço e ajustes');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('3. Dono');
    fillOwnerStep(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('4. Plano e trial');
    await waitFor(() =>
      expect(within(dialog).getByLabelText('Plano')).toHaveValue('plan-1'),
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avançar' }));
    await within(dialog).findByText('5. Revisão');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar salão' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Já existe');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Voltar' }));
    expect(await within(dialog).findByText('4. Plano e trial')).toBeInTheDocument();
  });
});
