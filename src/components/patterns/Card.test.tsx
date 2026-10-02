/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { Card, CardBody, CardHeader, CardTitle } from './Card';

describe('Card', () => {
  it('renderiza conteúdo com a receita padrão de shell', () => {
    const { container } = render(<Card className="custom-card">Resumo do mês</Card>);
    const card = container.firstElementChild!;
    expect(screen.getByText('Resumo do mês')).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl', 'border', 'border-border', 'bg-surface', 'custom-card');
  });

  it('compõe header, título e corpo', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Fila</CardTitle>
        </CardHeader>
        <CardBody>3 clientes aguardando</CardBody>
      </Card>
    );
    expect(screen.getByRole('heading', { name: 'Fila' })).toBeInTheDocument();
    expect(screen.getByText('3 clientes aguardando')).toBeInTheDocument();
  });
});
