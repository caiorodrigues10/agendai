import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SegmentPicker } from './SegmentPicker';
import type { BusinessSegment, TargetAudience } from '../../shared/segments';

const meta = {
  title: 'Domain/SegmentPicker',
  component: SegmentPicker,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: {
    onChange: () => undefined,
    onAudienceChange: () => undefined,
  },
  decorators: [story => <div className="w-[420px] bg-bg p-4 text-left">{story()}</div>],
} satisfies Meta<typeof SegmentPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado é controlado aqui porque o picker emite onChange, não guarda valor.
 * Os callbacks dos args continuam no-ops: o wrapper tem os dele.
 */
function controlled(initialSegment: BusinessSegment | null, initialAudience: TargetAudience | null) {
  return function Wrapper() {
    const [segment, setSegment] = useState<BusinessSegment | null>(initialSegment);
    const [audience, setAudience] = useState<TargetAudience | null>(initialAudience);
    return (
      <SegmentPicker
        value={segment}
        audience={audience}
        onChange={setSegment}
        onAudienceChange={setAudience}
      />
    );
  };
}

export const Default: Story = {
  render: controlled(null, null),
};

export const BarbeariaSelecionada: Story = {
  render: controlled('BARBERSHOP', 'MASCULINO'),
};

export const PetshopSelecionado: Story = {
  render: controlled('PETSHOP', null),
};

export const VeterinariaComPets: Story = {
  render: controlled('VETERINARY', null),
};

export const LavaJatoComVeiculos: Story = {
  render: controlled('CAR_WASH', null),
};

export const SaudeComAvisoDeProntuario: Story = {
  render: controlled('PHYSIOTHERAPY', null),
};

export const OutroSelecionado: Story = {
  render: controlled('OTHER', null),
};

export const ComErro: Story = {
  args: { error: 'Selecione o tipo do negócio.' },
  render: () => (
    <SegmentPicker
      value={null}
      audience={null}
      onChange={() => undefined}
      onAudienceChange={() => undefined}
      error="Selecione o tipo do negócio."
    />
  ),
};
