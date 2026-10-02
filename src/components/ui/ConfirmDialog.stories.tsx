import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfirmDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Encerrar sessão',
    message: 'Você precisará entrar de novo.',
    confirmLabel: 'Sair',
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export const Danger: Story = {
  args: {
    open: true,
    title: 'Excluir cliente',
    message: 'Esta ação não pode ser desfeita. O histórico do cliente será removido.',
    confirmLabel: 'Excluir',
    variant: 'danger',
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export const Loading: Story = {
  args: {
    open: true,
    title: 'Salvando alterações',
    message: 'Aguarde enquanto confirmamos o pagamento.',
    loading: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
};
