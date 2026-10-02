import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from './Field';

const meta = {
  title: 'UI/Field',
  component: Field,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Campo',
    children: null,
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Nome do cliente">
        <input className={FIELD_CONTROL} placeholder="Maria Silva" />
      </Field>
    </div>
  ),
};

export const WithHint: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Telefone" hint="Aparece no lembrete por WhatsApp.">
        <input className={FIELD_CONTROL} placeholder="(11) 99999-0000" />
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <Field label="E-mail" error="Informe um e-mail válido.">
        <input className={FIELD_CONTROL_ERROR} defaultValue="@" />
      </Field>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Preço do serviço">
        <input className={FIELD_CONTROL} defaultValue="R$ 45,00" disabled />
      </Field>
    </div>
  ),
};

export const Select: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Profissional">
        <select className={FIELD_CONTROL}>
          <option>Ana Souza</option>
          <option>Bruno Lima</option>
        </select>
      </Field>
    </div>
  ),
};
