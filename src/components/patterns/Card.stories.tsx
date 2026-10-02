import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardBody, CardHeader, CardTitle } from './Card';

const meta = {
  title: 'Padrões/Card',
  component: Card,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80 p-5">
      <p className="text-sm text-text-secondary">Conteúdo do card com a receita padrão.</p>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Fila de hoje</CardTitle>
        <span className="text-xs text-text-muted">3 clientes</span>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-text-secondary">Corpo do card abaixo do cabeçalho.</p>
      </CardBody>
    </Card>
  ),
};

export const InGrid: Story = {
  render: () => (
    <div className="grid w-96 grid-cols-2 gap-3">
      <Card className="p-4 text-sm text-text-secondary">Um</Card>
      <Card className="p-4 text-sm text-text-secondary">Dois</Card>
      <Card className="p-4 text-sm text-text-secondary">Três</Card>
      <Card className="p-4 text-sm text-text-secondary">Quatro</Card>
    </div>
  ),
};
