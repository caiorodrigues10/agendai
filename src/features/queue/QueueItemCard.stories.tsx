import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { QueueItem, Service } from '../../types';
import { QueueItemCard } from './QueueItemCard';

const service: Service = {
  id: 'svc-1',
  name: 'Corte + Barba',
  price: 55,
  avgTimeMinutes: 50,
  icon: 'scissors',
};

const baseItem: QueueItem = {
  id: 'q-1',
  customerName: 'Maria Silva',
  whatsapp: '5511999990000',
  serviceId: 'svc-1',
  joinedAt: Date.now() - 12 * 60 * 1000,
  status: 'waiting',
};

const meta = {
  title: 'Fila/QueueItemCard',
  component: QueueItemCard,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: {
    item: baseItem,
    service,
    position: 3,
    isAdmin: true,
    isCurrentUser: false,
    shopName: 'Barbearia Central',
    onStatusChange: fn(),
    onLeaveQueue: fn(),
  },
} satisfies Meta<typeof QueueItemCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {};

export const InChair: Story = {
  args: {
    item: { ...baseItem, status: 'in_chair' },
    position: 1,
    isCurrentUser: true,
    isAdmin: false,
  },
};

export const Completed: Story = {
  args: {
    item: { ...baseItem, status: 'completed', finalPrice: 55, paymentMethod: 'pix' },
    position: 0,
    onReturnToQueue: fn(),
  },
};

export const FirstInQueue: Story = {
  args: { position: 1, onAddDependent: fn() },
};
