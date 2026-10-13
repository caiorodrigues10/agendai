/// <reference types="vitest/globals" />
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { SegmentPicker } from './SegmentPicker';
import { ALL_SEGMENTS, SEGMENTS_BY_GROUP, type TargetAudience } from '../../shared/segments';

function setup(props?: Partial<Parameters<typeof SegmentPicker>[0]>) {
  const onChange = vi.fn();
  const onAudienceChange = vi.fn();
  const onOtherTextChange = vi.fn();
  const view = render(
    <SegmentPicker
      value={null}
      audience={null}
      onChange={onChange}
      onAudienceChange={onAudienceChange}
      onOtherTextChange={onOtherTextChange}
      {...props}
    />
  );
  return { ...view, onChange, onAudienceChange, onOtherTextChange };
}

describe('SegmentPicker', () => {
  it('renderiza todos os segmentos, agrupados, com "Outro" por último', () => {
    setup();
    expect(screen.getByRole('radiogroup', { name: /tipo do seu negócio/i })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(ALL_SEGMENTS.length);
    for (const group of SEGMENTS_BY_GROUP) {
      expect(screen.getByText(group.label), `grupo ${group.label}`).toBeInTheDocument();
    }
    const cards = screen.getAllByRole('radio');
    expect(cards[cards.length - 1]).toHaveTextContent(/qualquer outro tipo/i);
  });

  it('busca "unha" destaca Manicure e mantém "Outro" visível', () => {
    setup();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unha' } });
    expect(screen.getByRole('radio', { name: /manicure/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^barbearia/i })).toBeNull();
    expect(screen.getByRole('radio', { name: /qualquer outro tipo/i })).toBeInTheDocument();
  });

  it('busca sem resultado avisa e só resta "Outro"', () => {
    setup();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzz' } });
    expect(screen.getByText(/nenhum segmento encontrado/i)).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(1);
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

  it('mostra o público para segmentos de beleza e esconde em PETSHOP e em OTHER', () => {
    const view = setup({ value: 'BARBERSHOP', audience: 'MASCULINO' });
    expect(screen.getByRole('radiogroup', { name: /quem você atende/i })).toBeInTheDocument();

    view.rerender(
      <SegmentPicker
        value="PETSHOP"
        audience={null}
        onChange={() => undefined}
        onAudienceChange={() => undefined}
      />
    );
    expect(screen.queryByRole('radiogroup', { name: /quem você atende/i })).toBeNull();

    view.rerender(
      <SegmentPicker
        value="OTHER"
        audience={null}
        onChange={() => undefined}
        onAudienceChange={() => undefined}
      />
    );
    expect(screen.queryByRole('radiogroup', { name: /quem você atende/i })).toBeNull();
  });

  it('"Outro" abre o campo de texto livre e repassa o que foi digitado', () => {
    const { onOtherTextChange } = setup({ value: 'OTHER' });
    const field = screen.getByLabelText(/descreva seu negócio/i);
    fireEvent.change(field, { target: { value: 'Estúdio de pilates com aula individual' } });
    expect(onOtherTextChange).toHaveBeenCalledWith('Estúdio de pilates com aula individual');
    expect(field).toHaveAttribute('maxlength', '80');
  });

  it('o campo de texto livre some quando o segmento não é "Outro"', () => {
    const view = setup({ value: 'OTHER' });
    expect(screen.getByLabelText(/descreva seu negócio/i)).toBeInTheDocument();
    view.rerender(
      <SegmentPicker
        value="HAIR_SALON"
        audience="FEMININO"
        onChange={() => undefined}
        onAudienceChange={() => undefined}
      />
    );
    expect(screen.queryByLabelText(/descreva seu negócio/i)).toBeNull();
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
