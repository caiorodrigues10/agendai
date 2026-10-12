/// <reference types="vitest/globals" />
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { SegmentPicker } from './SegmentPicker';
import type { TargetAudience } from '../../shared/segments';

function setup(props?: Partial<Parameters<typeof SegmentPicker>[0]>) {
  const onChange = vi.fn();
  const onAudienceChange = vi.fn();
  const view = render(
    <SegmentPicker
      value={null}
      audience={null}
      onChange={onChange}
      onAudienceChange={onAudienceChange}
      {...props}
    />
  );
  return { ...view, onChange, onAudienceChange };
}

describe('SegmentPicker', () => {
  it('renderiza os 4 segmentos do cadastro como radios', () => {
    setup();
    const group = screen.getByRole('radiogroup', { name: /tipo do seu negócio/i });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /barbearia/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /salão de cabelo/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /manicure e nails/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /petshop/i })).toBeInTheDocument();
  });

  it('ao escolher um segmento emite o segmento e o público sugerido', () => {
    const { onChange, onAudienceChange } = setup();
    fireEvent.click(screen.getByRole('radio', { name: /barbearia/i }));
    expect(onChange).toHaveBeenCalledWith('BARBERSHOP');
    expect(onAudienceChange).toHaveBeenCalledWith('MASCULINO');
  });

  it('marca aria-checked no segmento selecionado', () => {
    setup({ value: 'NAIL_STUDIO', audience: 'FEMININO' });
    expect(screen.getByRole('radio', { name: /manicure e nails/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: /barbearia/i })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('mostra o público para segmentos de beleza e esconde em PETSHOP', async () => {
    const view = setup({ value: 'BARBERSHOP', audience: 'MASCULINO' });
    expect(await screen.findByRole('radiogroup', { name: /quem você atende/i })).toBeInTheDocument();

    view.rerender(
      <SegmentPicker
        value="PETSHOP"
        audience={null}
        onChange={() => undefined}
        onAudienceChange={() => undefined}
      />
    );
    expect(screen.queryByRole('radiogroup', { name: /quem você atende/i })).toBeNull();
  });

  it('setas movem a seleção do público', () => {
    // Harness com estado: o picker é controlado, então sem re-render o
    // aria-checked não muda (o teste anterior só provava o callback).
    function Harness() {
      const [audience, setAudience] = useState<TargetAudience | null>('UNISSEX');
      return (
        <SegmentPicker
          value="HAIR_SALON"
          audience={audience}
          onChange={() => undefined}
          onAudienceChange={setAudience}
        />
      );
    }
    render(<Harness />);
    const group = screen.getByRole('radiogroup', { name: /quem você atende/i });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: /masculino/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: /unissex/i })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('setas movem a seleção do segmento', () => {
    const { onChange } = setup({ value: 'BARBERSHOP', audience: 'MASCULINO' });
    const group = screen.getByRole('radiogroup', { name: /tipo do seu negócio/i });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('HAIR_SALON');
  });

  it('mostra o erro com role=alert e marca o fieldset como inválido', () => {
    setup({ error: 'Selecione o tipo do negócio.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione o tipo do negócio.');
    expect(screen.getByRole('radiogroup', { name: /tipo do seu negócio/i }).closest('fieldset')).toHaveAttribute('aria-invalid', 'true');
  });

  it('mostra o resumo do que será configurado depois da escolha', () => {
    setup({ value: 'PETSHOP' });
    expect(screen.getByText(/preparar serviços, textos e horários para petshops/i)).toBeInTheDocument();
  });
});
