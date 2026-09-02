import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SmartSelect } from './SmartSelect';

const options = [
  { value: 'cabelo', label: 'Corte de cabelo' },
  { value: 'barba', label: 'Barba' },
  { value: 'sobrancelha', label: 'Sobrancelha' },
];

describe('SmartSelect', () => {
  it('seleciona uma opção e fecha o menu', () => {
    let value: string | null = null;
    const view = render(<SmartSelect value={value} mode="single" options={options} onChange={next => { value = next; }} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Barba' }));
    expect(value).toBe('barba');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    view.unmount();
  });

  it('filtra opções ignorando acentos e maiúsculas', () => {
    render(<SmartSelect value={null} mode="single" searchable options={options} onChange={() => undefined} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'SOBRANCELHA' } });
    expect(screen.getByRole('option', { name: 'Sobrancelha' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Barba' })).not.toBeInTheDocument();
  });

  it('permite selecionar e remover vários valores', () => {
    let values: string[] = [];
    const view = render(<SmartSelect value={values} mode="multiple" options={options} onChange={next => { values = next; view.rerender(<SmartSelect value={values} mode="multiple" options={options} onChange={nextValue => { values = nextValue; }} />); }} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Barba' }));
    fireEvent.click(screen.getByRole('option', { name: 'Sobrancelha' }));
    expect(values).toEqual(['barba', 'sobrancelha']);
  });
});
