import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ServiceForm } from './ServiceForm';
const meta = {
  title: 'Catálogo/Formulário de serviço',
  component: ServiceForm,
  tags: ['test'],
  args: { onSave: fn(), onCancel: fn(), categories: [] },
} satisfies Meta<typeof ServiceForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Novo: Story = {};
