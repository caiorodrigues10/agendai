/// <reference types="vitest/globals" />
import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs, TabItem } from './Tabs';

const items: TabItem[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'fila', label: 'Fila' },
  { id: 'agenda', label: 'Agenda' },
];

function renderTabs(onChange = vi.fn(), disabled = false) {
  const all = disabled ? [...items, { id: 'rel', label: 'Relatórios', disabled: true }] : items;
  render(<Tabs ariaLabel="Seções" items={all} value="hoje" onChange={onChange} />);
  return onChange;
}

describe('Tabs', () => {
  it('expõe tablist acessível com aba selecionada', () => {
    renderTabs();
    const list = screen.getByRole('tablist', { name: 'Seções' });
    expect(list).toBeInTheDocument();
    const selected = screen.getByRole('tab', { name: 'Hoje' });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Fila' })).toHaveAttribute('aria-selected', 'false');
  });

  it('dispara onChange ao clicar', () => {
    const onChange = renderTabs();
    fireEvent.click(screen.getByRole('tab', { name: 'Fila' }));
    expect(onChange).toHaveBeenCalledWith('fila');
  });

  it('navega por teclado com ArrowRight/Home/End', () => {
    const onChange = renderTabs();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Hoje' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('fila');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Hoje' }), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('agenda');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Hoje' }), { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('hoje');
  });

  it('desabilita abas marcadas sem foco de teclado', () => {
    renderTabs(vi.fn(), true);
    expect(screen.getByRole('tab', { name: 'Relatórios' })).toBeDisabled();
  });
});
