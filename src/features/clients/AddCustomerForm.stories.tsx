import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AddCustomerForm } from './AddCustomerForm';
import { services } from '../appointments/storyFixtures';
const meta = {
  title: 'Fila/Adicionar cliente',
  component: AddCustomerForm,
  tags: ['test'],
  args: { services, onJoin: fn().mockResolvedValue(undefined), onCancel: fn(), isStaffMode: true },
} satisfies Meta<typeof AddCustomerForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Equipe: Story = {};
export const Cliente: Story = { args: { isStaffMode: false } };
export const SemServicos: Story = { args: { services: [] } };
