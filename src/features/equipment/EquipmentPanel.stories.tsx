import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fireEvent, userEvent, within } from 'storybook/test';
import { EquipmentPanel } from './EquipmentPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const equipment = [
  {
    id: 'e1',
    barbershopId: 'shop-1',
    name: 'Máquina Wahl',
    category: 'BARBER_TOOLS',
    brand: 'Wahl',
    model: 'Magic Clip',
    serialNumber: 'SN-001',
    quantityTotal: 3,
    quantityAvailable: 1,
    condition: 'GOOD',
    minQuantity: 2,
    unitCost: 450,
    supplier: 'Distribuidora Central',
    purchaseDate: null,
    warrantyUntil: null,
    notes: null,
    isActive: true,
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-09-01T12:00:00.000Z',
  },
  {
    id: 'e2',
    barbershopId: 'shop-1',
    name: 'Lâminas descartáveis',
    category: 'BEARD_TOOLS',
    brand: 'Philips',
    model: null,
    serialNumber: null,
    quantityTotal: 1,
    quantityAvailable: 0,
    condition: 'NEW',
    minQuantity: 10,
    unitCost: 4,
    supplier: 'Distribuidora Central',
    purchaseDate: null,
    warrantyUntil: null,
    notes: null,
    isActive: true,
    createdAt: '2026-09-10T12:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
  },
];

const dashboard = {
  totalEquipment: 6,
  activeEquipment: 5,
  lowStockCount: 2,
  pendingNeeds: 3,
  recentMovements: 4,
  lowStockItems: [],
  pendingNeedsList: [],
  recentNeeds: [],
};

const mswHandlers = (rows: unknown[]) => [
  http.get('/api/barbershops/:id/equipment', () => json(rows)),
  http.get('/api/barbershops/:id/equipment-dashboard', () => json(dashboard)),
];

const meta = {
  title: 'Equipamentos/EquipmentPanel',
  component: EquipmentPanel,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers(equipment) },
  },
} satisfies Meta<typeof EquipmentPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vazio: Story = {
  parameters: { msw: { handlers: mswHandlers([]) } },
};

export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/barbershops/:id/equipment', () =>
          HttpResponse.json({ success: false, message: 'Erro ao carregar equipamentos' }, { status: 500 })
        ),
        http.get('/api/barbershops/:id/equipment-dashboard', () => json(dashboard)),
      ],
    },
  },
};

/**
 * Falha da criação de equipamento (POST /api/barbershops/:id/equipment → 500):
 * abre o modal "Novo equipamento", preenche o nome e submete — o banner
 * `bg-danger/10` (EquipmentPanel.tsx:707) fica visível com o modal aberto.
 */
export const ErroEquip: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers(equipment),
        http.post('/api/barbershops/:id/equipment', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível salvar o equipamento.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Controle de Estoque', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Novo equipamento' }, { timeout: 10000 })
    );
    await canvas.findByRole('heading', { name: 'Novo equipamento' }, { timeout: 10000 });
    fireEvent.change(await canvas.findByLabelText('Nome', {}, { timeout: 10000 }), {
      target: { value: 'Trexadeira Teste' },
    });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Criar' }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível salvar o equipamento/, {}, { timeout: 10000 });
    await canvas.findByRole('heading', { name: 'Novo equipamento' }, { timeout: 10000 });
  },
};

/**
 * Falha do registro de movimentação (POST /api/barbershops/:id/equipment-movements
 * → 500): abre o modal "Nova movimentacao", seleciona um equipamento via
 * SmartSelect e submete — o banner (EquipmentPanel.tsx:772) fica visível com o
 * modal aberto.
 */
export const ErroMov: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers(equipment),
        http.get('/api/barbershops/:id/equipment-movements', () => json([])),
        http.post('/api/barbershops/:id/equipment-movements', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível registrar a movimentação.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Controle de Estoque', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Movimentacoes' }, { timeout: 10000 })
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Nova movimentacao' }, { timeout: 10000 })
    );
    await canvas.findByRole('heading', { name: 'Nova movimentacao' }, { timeout: 10000 });
    const equipCombo = await canvas.findByRole(
      'combobox',
      { name: 'Buscar equipamento' },
      { timeout: 10000 }
    );
    await userEvent.click(equipCombo);
    const body = within(document.body);
    const option = await body.findByRole('option', { name: /Máquina Wahl/ }, { timeout: 10000 });
    fireEvent.click(option);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Registrar' }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível registrar a movimentação/, {}, { timeout: 10000 });
    await canvas.findByRole('heading', { name: 'Nova movimentacao' }, { timeout: 10000 });
  },
};

/**
 * Falha da criação de necessidade (POST /api/barbershops/:id/equipment-needs
 * → 500): abre o modal "Nova necessidade", preenche o nome e submete — o
 * banner (EquipmentPanel.tsx:807) fica visível com o modal aberto.
 */
export const ErroNeed: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers(equipment),
        http.get('/api/barbershops/:id/equipment-needs', () => json([])),
        http.post('/api/barbershops/:id/equipment-needs', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível criar a necessidade.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Controle de Estoque', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Necessidades' }, { timeout: 10000 })
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Nova necessidade' }, { timeout: 10000 })
    );
    await canvas.findByRole('heading', { name: 'Nova necessidade' }, { timeout: 10000 });
    fireEvent.change(await canvas.findByLabelText('Nome', {}, { timeout: 10000 }), {
      target: { value: 'Lâminas extras' },
    });
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Criar' }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível criar a necessidade/, {}, { timeout: 10000 });
    await canvas.findByRole('heading', { name: 'Nova necessidade' }, { timeout: 10000 });
  },
};
