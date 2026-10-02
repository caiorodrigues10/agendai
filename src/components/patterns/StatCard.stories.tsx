import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuCalendarCheck, LuUsers } from 'react-icons/lu';
import { StatCard } from './StatCard';

const meta = {
  title: 'Padrões/StatCard',
  component: StatCard,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Agendamentos', value: '128' },
};

export const WithDeltaUp: Story = {
  args: {
    label: 'Faturamento',
    value: 'R$ 4.280',
    delta: { label: '+12% vs ontem', direction: 'up' },
    hint: 'meta R$ 5.000',
  },
};

export const WithDeltaDown: Story = {
  args: {
    label: 'Cancelamentos',
    value: '7',
    delta: { label: '-3 vs ontem', direction: 'down' },
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Clientes novos',
    value: '18',
    icon: <LuUsers size={18} />,
    delta: { label: '+4 na semana', direction: 'up' },
  },
};

export const NeutralDelta: Story = {
  args: {
    label: 'Ocupação',
    value: '82%',
    icon: <LuCalendarCheck size={18} />,
    delta: { label: 'estável', direction: 'neutral' },
  },
};
