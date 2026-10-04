import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
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
