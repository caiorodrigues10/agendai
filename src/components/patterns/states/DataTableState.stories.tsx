import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DataTableState } from './DataTableState';

const meta = {
  title: 'Padrões/DataTableState',
  component: DataTableState,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DataTableState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { loading: true },
};

export const Error: Story = {
  args: {
    error: 'Não foi possível carregar os agendamentos.',
    onRetry: fn(),
  },
};

export const Empty: Story = {
  args: {
    isEmpty: true,
    emptyTitle: 'Nenhum agendamento',
    emptyDescription: 'Quando houver agendamentos, eles aparecem aqui.',
  },
};

export const EmptyWithActionlessDescription: Story = {
  args: { isEmpty: true },
};
