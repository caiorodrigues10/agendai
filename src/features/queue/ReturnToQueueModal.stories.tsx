import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { QueueItem, Service } from '../../types';
import { ReturnToQueueModal } from './ReturnToQueueModal';

const services: Service[] = [
  { id: 'svc-1', name: 'Corte + Barba', price: 55, avgTimeMinutes: 50, icon: 'scissors' },
  { id: 'svc-2', name: 'Corte social', price: 35, avgTimeMinutes: 30, icon: 'scissors' },
];

const baseItem: QueueItem = {
  id: 'q-done',
  customerName: 'Carlos Mendes',
  whatsapp: '5511988887777',
  serviceId: 'svc-1',
  joinedAt: Date.now() - 60 * 60 * 1000,
  status: 'completed',
  finalPrice: 55,
  paymentMethod: 'pix',
};

const waiting: QueueItem[] = [
  { id: 'q-1', customerName: 'Ana Souza', whatsapp: '5511911112222', serviceId: 'svc-2', joinedAt: Date.now() - 30 * 60 * 1000, status: 'waiting' },
  { id: 'q-2', customerName: 'Bruno Lima', whatsapp: '5511933334444', serviceId: 'svc-1', joinedAt: Date.now() - 20 * 60 * 1000, status: 'waiting' },
  { id: 'q-3', customerName: 'Carla Dias', whatsapp: '5511955556666', serviceId: 'svc-2', joinedAt: Date.now() - 10 * 60 * 1000, status: 'waiting' },
];

const meta = {
  title: 'Fila/ReturnToQueueModal',
  component: ReturnToQueueModal,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: {
    item: baseItem,
    waiting,
    services,
    onConfirm: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof ReturnToQueueModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyQueue: Story = {
  args: { waiting: [] },
};

export const Submitting: Story = {
  args: { submitting: true },
};
