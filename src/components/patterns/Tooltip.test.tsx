/// <reference types="vitest/globals" />
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('mostra o bubble no hover e vincula aria-describedby', async () => {
    render(
      <Tooltip label="Clientes atendidos hoje">
        <button type="button">3 atendidos</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: '3 atendidos' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Clientes atendidos hoje');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);

    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('mostra e oculta o bubble com foco do filho', async () => {
    render(
      <Tooltip label="Atualizado agora">
        <button type="button">Status</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Status' });
    fireEvent.focus(trigger);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    fireEvent.blur(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });
});
