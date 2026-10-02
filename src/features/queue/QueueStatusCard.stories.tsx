import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AIInsight } from '../../types';
import { QueueStatusCard } from './QueueStatusCard';

const meta = {
  title: 'Fila/QueueStatusCard',
  component: QueueStatusCard,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: { shopName: 'Barbearia Central', isOpen: true, insight: null },
} satisfies Meta<typeof QueueStatusCard>;
export default meta;
type Story = StoryObj<typeof meta>;

const insight: AIInsight = {
  estimatedWait: '~25 min',
  message: 'Movimento alto às quintas — considere um profissional extra à tarde.',
  busyLevel: 'high',
};

export const Open: Story = {
  args: { peopleWaiting: 4, completedCount: 12, inChairName: 'João Pereira' },
};

export const StaffStats: Story = {
  args: {
    peopleWaiting: 6,
    completedCount: 8,
    inChairName: 'Ana Souza',
    showStaffStats: true,
    insight,
  },
};

export const Closed: Story = {
  args: { isOpen: false, queueClosed: true, peopleWaiting: 0, completedCount: 0 },
};
