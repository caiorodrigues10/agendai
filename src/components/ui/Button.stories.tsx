import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Confirmar agendamento' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancelar' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ver detalhes' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Excluir cliente' },
};

export const Loading: Story = {
  args: { loading: true, children: 'Salvar' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Indisponível' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4">
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="icon" aria-label="Ação com ícone">
        ★
      </Button>
    </div>
  ),
};
