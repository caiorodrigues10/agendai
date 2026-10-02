import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Padrões/Tooltip',
  component: Tooltip,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    label: 'Clientes atendidos hoje',
    children: <button type="button">3 atendidos</button>,
  },
};

export const Bottom: Story = {
  args: {
    placement: 'bottom',
    label: 'Atualizado há 2 minutos',
    children: <button type="button">Status</button>,
  },
};

export const OnIcon: Story = {
  args: {
    label: 'Instalar aplicativo',
    children: (
      <button type="button" aria-label="Instalar aplicativo" className="rounded-lg border border-border p-2">
        ↓
      </button>
    ),
  },
};
